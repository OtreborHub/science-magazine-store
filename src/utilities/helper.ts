import { ethers } from "ethers";

export const formatDate = (release_date: number) => {
    return new Date(release_date)
    .toLocaleDateString("it-IT", {year: "numeric", day: "2-digit", month: "2-digit"})
    .replaceAll("/", "-");
}

export const formatNumberAddress = (address: string) => {
    return address.substring(0, 8) + "..." + address.substring(address.length - 8, address.length)
}

export const formatBalance = (balance: number) => {
    return ethers.formatUnits(balance, 18);
}

export function getLastDayOfMonth(year: number, month: number): number {
    return new Date(year, month, 1).getTime();
}

export function getFirstDayOfMonth(year: number, month: number): number {
    return new Date(year, month, 0, 23, 59, 59).getTime();
}

export const addressValidation = (address: string) => {
    return address !== "" && address.includes("0x") && address.length === 42;
}