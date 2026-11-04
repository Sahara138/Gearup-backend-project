export interface RegisterUserPayload {
    email: string;
    name: string;
    password: string;
    profilePhoto?: string;
    bio?: string;
}