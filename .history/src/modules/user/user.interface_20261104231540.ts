export interface RegisterUserPayload {
    name: string;
    email: string;
    password: string;
    phone
    profilePhoto?: string;
    address?: string;
}