import { create } from 'zustand';
import supabase from '@/lib/Supabase';

// Flujo con verificación de email via OTP
export type RegistrationStep = 'email' | 'verification' | 'profile' | 'complete';

interface EmailData {
  email: string | undefined;
  password: string | undefined;
}

interface ProfileData {
  name: string;
  last_name: string;
  username: string;
}

interface RegistrationFlowState {
  // Estado del flujo
  currentStep: RegistrationStep;
  isLoading: boolean;
  error: string | null;

  // Datos del registro (sin información sensible)
  emailData: Partial<EmailData>;
  verificationCode: string;
  profileData: Partial<ProfileData>;
  authId: string | null;

  // Acciones de navegación
  setStep: (step: RegistrationStep) => void;
  nextStep: () => void;
  previousStep: () => void;

  // Acciones de estado
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Acciones de datos
  setEmailData: (data: Partial<EmailData>) => void;
  setVerificationCode: (code: string) => void;
  setProfileData: (data: Partial<ProfileData>) => void;
  setAuthId: (authId: string) => void;

  // Acciones del flujo de registro
  validateEmail: (email: string, password: string) => Promise<boolean>;
  verifyCode: (code: string) => Promise<boolean>;
  completeRegistration: (profileData: ProfileData) => Promise<boolean>;
  resendCode: () => Promise<boolean>;

  // Utilidades
  reset: () => void;
  canProceed: () => boolean;
}

// Flujo completo: email -> verification -> profile -> complete
const STEP_ORDER: RegistrationStep[] = ['email', 'verification', 'profile', 'complete'];

export const useRegistrationFlowStore = create<RegistrationFlowState>((set, get) => ({
  // Estado inicial
  currentStep: 'email',
  isLoading: false,
  error: null,
  emailData: {},
  verificationCode: '',
  profileData: {},
  authId: null,

  // Navegación
  setStep: (step) => set({ currentStep: step }),

  nextStep: () => {
    const currentIndex = STEP_ORDER.indexOf(get().currentStep);
    if (currentIndex < STEP_ORDER.length - 1) {
      set({ currentStep: STEP_ORDER[currentIndex + 1], error: null });
    }
  },

  previousStep: () => {
    const currentIndex = STEP_ORDER.indexOf(get().currentStep);
    if (currentIndex > 0) {
      set({ currentStep: STEP_ORDER[currentIndex - 1], error: null });
    }
  },

  // Estado
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),

  // Datos
  setEmailData: (data) => set((state) => ({ emailData: { ...state.emailData, ...data } })),
  setVerificationCode: (code) => set({ verificationCode: code }),
  setProfileData: (data) => set((state) => ({ profileData: { ...state.profileData, ...data } })),
  setAuthId: (authId) => set({ authId }),

  // Registro inicial con envío de código OTP
  validateEmail: async (email: string, password: string) => {
    set({ isLoading: true, error: null });

    try {
      // 1. Validar que NO exista en tabla person
      const { data: personData } = await supabase
        .from('person')
        .select('email')
        .eq('email', email)
        .maybeSingle();

      if (personData) {
        set({
          error: 'Este correo ya está registrado como usuario regular. Los administradores deben usar un correo diferente.',
          isLoading: false
        });
        return false;
      }

      // 2. Validar que NO exista en tabla admins
      const { data: adminData } = await supabase
        .from('admins')
        .select('email')
        .eq('email', email)
        .maybeSingle();

      if (adminData) {
        set({
          error: 'Este correo ya está registrado. Por favor inicia sesión.',
          isLoading: false
        });
        return false;
      }

      // 3. Crear usuario con signUp (esto creará el usuario pero no lo activará hasta verificar OTP)
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) {
        set({ error: signUpError.message, isLoading: false });
        return false;
      }

      // 4. Enviar código OTP para verificación
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false, // Ya creamos el usuario arriba
        }
      });

      if (otpError) {
        set({ error: otpError.message, isLoading: false });
        return false;
      }

      // 5. Guardar datos temporales (sin password por seguridad)
      set({
        emailData: { email, password }, // Necesitamos password temporalmente para completar registro
        authId: signUpData.user?.id || null,
        isLoading: false,
        error: null
      });

      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al enviar código de verificación';
      set({ error: message, isLoading: false });
      return false;
    }
  },

  // Verificación del código OTP enviado por email
  verifyCode: async (code: string) => {
    set({ isLoading: true, error: null });

    try {
      const { emailData } = get();

      if (!emailData.email) {
        set({ error: 'Email no encontrado para verificar', isLoading: false });
        return false;
      }

      // 1. Verificar el código OTP
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        email: emailData.email as string,
        token: code,
        type: 'email',
      });

      if (verifyError || !data.user) {
        set({ error: 'Código de verificación inválido o expirado', isLoading: false });
        return false;
      }

      // 2. Usuario verificado exitosamente
      set({
        verificationCode: code,
        authId: data.user.id,
        isLoading: false,
        error: null
      });

      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al verificar el código';
      set({ error: message, isLoading: false });
      return false;
    }
  },

  // Completar registro después de verificar email
  completeRegistration: async (profileData: ProfileData) => {
    set({ isLoading: true, error: null });

    try {
      const { emailData, authId } = get();

      if (!emailData.email || !authId) {
        set({ error: 'Datos incompletos para completar el registro', isLoading: false });
        return false;
      }

      // 1. Validar que el username sea único
      const { data: existingUsername } = await supabase
        .from('admins')
        .select('username')
        .eq('username', profileData.username)
        .maybeSingle();

      if (existingUsername) {
        set({ error: 'El nombre de usuario ya está en uso', isLoading: false });
        return false;
      }

      // 2. Crear registro en tabla users primero (requerido por foreign key constraint)
      const { error: userInsertError } = await supabase
        .from('users')
        .insert({
          id: authId, // Usar el mismo ID de auth
          email: emailData.email,
          name: profileData.name,
          last_name: profileData.last_name,
        });

      if (userInsertError) {
        set({ error: userInsertError.message, isLoading: false });
        return false;
      }

      // 3. Insertar en tabla admins (referencia a users.id via auth_id)
      const { error: insertError } = await supabase
        .from('admins')
        .insert({
          auth_id: authId,
          email: emailData.email,
          username: profileData.username,
          name: profileData.name,
          last_name: profileData.last_name,
          status: false, // Requiere aprobación manual
          admin_status: false,
        });

      if (insertError) {
        set({ error: insertError.message, isLoading: false });
        return false;
      }

      // 4. Limpiar password del store (seguridad)
      set({
        emailData: { email: emailData.email }, // Solo mantener email
        profileData,
        isLoading: false,
        error: null
      });

      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al completar el registro';
      set({ error: message, isLoading: false });
      return false;
    }
  },

  // Reenviar código OTP
  resendCode: async () => {
    set({ isLoading: true, error: null });

    try {
      const { emailData } = get();

      if (!emailData.email) {
        set({ error: 'Email no encontrado', isLoading: false });
        return false;
      }

      // Reenviar código OTP
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: emailData.email as string,
        options: {
          shouldCreateUser: false, // No crear usuario, ya existe
        }
      });

      // Manejar error de rate limiting de forma especial
      if (otpError) {
        if (otpError.message.includes('For security purposes') || 
            otpError.message.includes('rate limit') ||
            otpError.message.includes('over_email_send_rate_limit')) {
          // Rate limiting - el código fue enviado pero hay que esperar
          set({
            error: 'Código enviado. Debes esperar 60 segundos antes de solicitar otro.',
            isLoading: false
          });
          return true; // Retornar true porque el código SÍ se envió
        } else {
          // Otro error real
          set({ error: otpError.message, isLoading: false });
          return false;
        }
      }

      set({ isLoading: false, error: null });
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al reenviar el código';
      set({ error: message, isLoading: false });
      return false;
    }
  },

  // Utilidades
  canProceed: () => {
    const { currentStep, emailData, profileData, verificationCode } = get();

    switch (currentStep) {
      case 'email':
        return !!emailData.email && !!emailData.password;
      case 'verification':
        return !!verificationCode && verificationCode.length === 6;
      case 'profile':
        return !!profileData.name && !!profileData.last_name && !!profileData.username;
      default:
        return false;
    }
  },

  reset: () => {
    set({
      currentStep: 'email',
      isLoading: false,
      error: null,
      emailData: {},
      verificationCode: '',
      profileData: {},
      authId: null,
    });
  },
}));
