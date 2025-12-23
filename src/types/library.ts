import { PageData, TOCItem } from '../types';

export interface BookData {
    id: string;
    title: string;
    author?: string;
    uploadDate: number;
    pages: PageData[];
    toc: TOCItem[];
    fileSize?: number;
    fileName: string;
}
