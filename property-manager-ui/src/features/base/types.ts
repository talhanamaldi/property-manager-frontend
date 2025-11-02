export type ResponseMessage = {
    message: string;
}

export type BaseEntity = {
    id: number;
    createdDate?: string;
    updatedDate?: string | null;
    isDeleted?: number;
    updateInsertUserId?: number;
};