import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios"

export abstract class BaseService {
    protected readonly http: AxiosInstance

    constructor(baseURL: string) {
        this.http = axios.create({
            baseURL,
            headers: {
                "Content-Type": "application/json",
            },
        })

        this.http.interceptors.request.use((config) => {
            return config
        })

        this.http.interceptors.response.use(
            (response) => response,
            (error) => {
                console.error("HTTP error:", error)
                return Promise.reject(error)
            }
        )
    }

    protected async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        const res: AxiosResponse<T> = await this.http.get(url, config)
        return res.data
    }

    protected async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
        const res: AxiosResponse<T> = await this.http.post(url, data, config)
        return res.data
    }

    protected async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
        const res: AxiosResponse<T> = await this.http.put(url, data, config)
        return res.data
    }

    protected async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
        const res: AxiosResponse<T> = await this.http.patch(url, data, config)
        return res.data
    }

    protected async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        const res: AxiosResponse<T> = await this.http.delete(url, config)
        return res.data
    }
}
