export type DataObject = {
    DevAddr: string,
    Type: string,
    [key: string]: { [key: string]: number | string }[] | string | number
}