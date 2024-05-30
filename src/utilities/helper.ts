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
    let formatted = ethers.formatUnits(balance, 18);
    return formatted;
}

export function getLastDayOfMonth(year: number, month: number): number {
    return new Date(year, month - 1, 1).getTime();
}

export function getFirstDayOfMonth(year: number, month: number): number {
    return new Date(year, month, 0).getTime();
}