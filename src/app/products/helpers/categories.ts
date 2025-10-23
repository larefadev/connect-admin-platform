export interface Category {
  idx: number;
  Categoria: string;
  Nombre: string;
  Descripcion: string;
  Codigo: string;
}

export const categories: Category[] = [
  {"idx":0,"Categoria":"Autos y Camionetas / Suspensión y Dirección","Nombre":"Suspensión y Dirección de Autos y Camionetas","Descripcion":"Refacciones de Suspensión y Dirección para Autos y Camionetas","Codigo":"D01-C01"},
  {"idx":1,"Categoria":"Autos y Camionetas / Refrigeración","Nombre":"Refrigeración de Autos y Camionetas","Descripcion":"Refacciones de Refrigeración para Autos y Camionetas","Codigo":"D01-C02"},
  {"idx":2,"Categoria":"Autos y Camionetas / Frenos","Nombre":"Frenos de Autos y Camionetas","Descripcion":"Refacciones de Frenos para Autos y Camionetas","Codigo":"D01-C03"},
  {"idx":3,"Categoria":"Autos y Camionetas / Transmisión","Nombre":"Transmisión de Autos y Camionetas","Descripcion":"Refacciones de Transmisión para Autos y Camionetas","Codigo":"D01-C04"},
  {"idx":4,"Categoria":"Autos y Camionetas / Eléctrico","Nombre":"Eléctrico de Autos y Camionetas","Descripcion":"Refacciones de Eléctrico para Autos y Camionetas","Codigo":"D01-C05"},
  {"idx":5,"Categoria":"Autos y Camionetas / Motor","Nombre":"Motor de Autos y Camionetas","Descripcion":"Refacciones de Motor para Autos y Camionetas","Codigo":"D01-C06"},
  {"idx":6,"Categoria":"Autos y Camionetas / Colisión","Nombre":"Colisión de Autos y Camionetas","Descripcion":"Refacciones de Colisión para Autos y Camionetas","Codigo":"D01-C07"},
  {"idx":7,"Categoria":"Tractocamiones / Suspensión y Dirección","Nombre":"Suspensión y Dirección de Tractocamiones","Descripcion":"Refacciones de Suspensión y Dirección para Tractocamiones","Codigo":"D02-C08"},
  {"idx":8,"Categoria":"Tractocamiones / Refrigeración","Nombre":"Refrigeración de Tractocamiones","Descripcion":"Refacciones de Refrigeración para Tractocamiones","Codigo":"D02-C09"},
  {"idx":9,"Categoria":"Tractocamiones / Frenos","Nombre":"Frenos de Tractocamiones","Descripcion":"Refacciones de Frenos para Tractocamiones","Codigo":"D02-C10"},
  {"idx":10,"Categoria":"Tractocamiones / Transmisión","Nombre":"Transmisión de Tractocamiones","Descripcion":"Refacciones de Transmisión para Tractocamiones","Codigo":"D02-C11"},
  {"idx":11,"Categoria":"Tractocamiones / Eléctrico","Nombre":"Eléctrico de Tractocamiones","Descripcion":"Refacciones de Eléctrico para Tractocamiones","Codigo":"D02-C12"},
  {"idx":12,"Categoria":"Tractocamiones / Motor","Nombre":"Motor de Tractocamiones","Descripcion":"Refacciones de Motor para Tractocamiones","Codigo":"D02-C13"},
  {"idx":13,"Categoria":"Tractocamiones / Colisión","Nombre":"Colisión de Tractocamiones","Descripcion":"Refacciones de Colisión para Tractocamiones","Codigo":"D02-C14"},
  {"idx":14,"Categoria":"Motocicletas / Chasis","Nombre":"Chasis de Motocicletas","Descripcion":"Refacciones de Chasis para Motocicletas","Codigo":"D03-C15"},
  {"idx":15,"Categoria":"Motocicletas / Eléctrico","Nombre":"Eléctrico de Motocicletas","Descripcion":"Refacciones de Eléctrico para Motocicletas","Codigo":"D03-C16"},
  {"idx":16,"Categoria":"Motocicletas / Frenos","Nombre":"Frenos de Motocicletas","Descripcion":"Refacciones de Frenos para Motocicletas","Codigo":"D03-C17"},
  {"idx":17,"Categoria":"Motocicletas / Motor","Nombre":"Motor de Motocicletas","Descripcion":"Refacciones de Motor para Motocicletas","Codigo":"D03-C18"},
  {"idx":18,"Categoria":"Motocicletas / Ruedas","Nombre":"Ruedas de Motocicletas","Descripcion":"Refacciones de Ruedas para Motocicletas","Codigo":"D03-C19"},
  {"idx":19,"Categoria":"Motocicletas / Suspensión","Nombre":"Suspensión de Motocicletas","Descripcion":"Refacciones de Suspensión para Motocicletas","Codigo":"D03-C20"},
  {"idx":20,"Categoria":"Motocicletas / Transmisión","Nombre":"Transmisión de Motocicletas","Descripcion":"Refacciones de Transmisión para Motocicletas","Codigo":"D03-C21"},
  {"idx":21,"Categoria":"Motocicletas / Accesorios","Nombre":"Accesorios de Motocicletas","Descripcion":"Refacciones de Accesorios para Motocicletas","Codigo":"D03-C22"},
  {"idx":22,"Categoria":"Motocicletas / Protección","Nombre":"Protección de Motocicletas","Descripcion":"Refacciones de Protección para Motocicletas","Codigo":"D03-C23"},
  {"idx":23,"Categoria":"Llantas / Auto","Nombre":"Llantas de Auto","Descripcion":"Llantas para Auto","Codigo":"D04-C24"},
  {"idx":24,"Categoria":"Llantas / Camioneta","Nombre":"Llantas de Camioneta","Descripcion":"Llantas para Camioneta","Codigo":"D04-C25"},
  {"idx":25,"Categoria":"Llantas / Todoterreno","Nombre":"Llantas de Todoterreno","Descripcion":"Llantas para Todoterreno","Codigo":"D04-C26"},
  {"idx":26,"Categoria":"Llantas / Camión y Tractocamión","Nombre":"Llantas de Camión y Tractocamión","Descripcion":"Llantas para Camión y Tractocamión","Codigo":"D04-C27"},
  {"idx":27,"Categoria":"Equipo y Herramientas / Automotriz","Nombre":"Equipo y Herramienta Automotriz","Descripcion":"Equipo y Herramienta Automotriz","Codigo":"D05-C28"},
  {"idx":28,"Categoria":"Equipo y Herramientas / Industrial","Nombre":"Equipo y Herramienta Industrial","Descripcion":"Equipo y Herramienta Industrial","Codigo":"D05-C29"},
  {"idx":29,"Categoria":"Equipo y Herramientas / Eléctrico","Nombre":"Equipo y Herramienta Eléctrico","Descripcion":"Equipo y Herramienta Eléctrico","Codigo":"D05-C30"},
  {"idx":30,"Categoria":"Equipo y Herramientas / Ferretería","Nombre":"Equipo y Herramienta Ferretería","Descripcion":"Refacciones de Ferretería","Codigo":"D05-C31"},
  {"idx":31,"Categoria":"Equipo y Herramientas / Motociclismo","Nombre":"Equipo y Herramienta para Motociclismo","Descripcion":"Equipo y Herramienta para Motociclismo","Codigo":"D05-C32"},
  {"idx":32,"Categoria":"Equipo y Herramientas / Ciclismo","Nombre":"Equipo y Herramienta para Ciclismo","Descripcion":"Equipo y Herramienta para Ciclismo","Codigo":"D05-C33"},
  {"idx":33,"Categoria":"Aceites y Lubricantes / Motor a Gasolina","Nombre":"Aceites y Lubricantes para Motor a Gasolina","Descripcion":"Aceites y Lubricantes para Motor a Gasolina","Codigo":"D06-C34"},
  {"idx":34,"Categoria":"Aceites y Lubricantes / Motor a Diesel","Nombre":"Aceites y Lubricantes para Motor a Diesel","Descripcion":"Aceites y Lubricantes para Motor a Diesel","Codigo":"D06-C35"},
  {"idx":35,"Categoria":"Aceites y Lubricantes / Líquido de Frenos","Nombre":"Líquido de Frenos","Descripcion":"Líquido de Frenos","Codigo":"D06-C36"},
  {"idx":36,"Categoria":"Aceites y Lubricantes / Grasas","Nombre":"Grasas","Descripcion":"Grasas","Codigo":"D06-C37"},
  {"idx":37,"Categoria":"Accesorios / Focos","Nombre":"Focos","Descripcion":"Focos","Codigo":"D08-C38"},
  {"idx":38,"Categoria":"Accesorios / Plumas Limpiaparabrisas","Nombre":"Plumas Limpiaparabrisas","Descripcion":"Plumas Limpiaparabrisas","Codigo":"D08-C39"},
  {"idx":39,"Categoria":"Accesorios / Desodorantes para Auto","Nombre":"Desodorantes para Auto","Descripcion":"Desodorantes para Auto","Codigo":"D08-C40"}
];
