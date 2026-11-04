export interface RegisterUserPayload {
    name: string;
    email: string;
    password: string;
    phoneNumber: string
    profilePhoto?: string;
    address?: string;
}