import { ErrorMessage } from "./error";

interface NavbarProps {
    connect: () => void;
}

interface ErrorProps {
    errorMessage: ErrorMessage;
}

interface Magazine {
    address: string;
    title: string;
    release_date: number;
    content: string;
    cover: string;
    summary: string;
}

interface ComplexCardProps {
    magazine: Magazine;
    singlePrice: number;
    owned: boolean;
}

interface Subscription {
    address: string;
    expire_date: number;
    available_magazines: string[];
}

interface UserProps {
    lastMagazine: Magazine;
    releasedMagazines: Magazine[];
}

interface AdminProps {
    notReleasedMagazines: Magazine[];
    releasedMagazines: Magazine[];
}

interface CustomSelectProps {
    input: string;
    handleChanges: () => void;
}

interface SearchFormProps {
    handleSearch: (event: any) => any;
    handleClear: (event: any) => any;
}

interface MainFormProps {
    singlePrice: number,
    annualPrice: number
    lastMagazine: Magazine
    handleSubmit: (event: any) => any;
}

interface LoaderProps {
    loading: boolean
}

export type { NavbarProps, ErrorProps, ComplexCardProps, Magazine, Subscription, UserProps, AdminProps, CustomSelectProps, SearchFormProps, MainFormProps, LoaderProps }