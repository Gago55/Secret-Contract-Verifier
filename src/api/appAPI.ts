import { secretContracts } from "./axiosInstances";

export type ContractType = {
    address: string
    codeId: number
    label: string
    creator: string
}

export type CodeType = {
    id: number
    isVerified: boolean
    creator: string
    checksum: string
    source?: string
    builder?: 'enigmampc/secret-contract-optimizer:1.0.0' | 'enigmampc/secret-contract-optimizer:1.0.1' | 'enigmampc/secret-contract-optimizer:1.0.2' | 'enigmampc/secret-contract-optimizer:1.0.3' | 'enigmampc/secret-contract-optimizer:1.0.4'
    contracts: Array<ContractType>
}

type VerifyResponseType = {
    link: string
}

export const fetchContractByAddress = (address: string) => (
    secretContracts.get<ContractType>(`/contracts/${address}`).then(res => res.data)
)

export const fetchContractsByCodeId = (codeId: string | number) => (
    secretContracts.get<Array<ContractType>>(`/contracts/codeId/${codeId}`).then(res => res.data)
)

export const fetchCode = (id: string | number) => (
    secretContracts.get<CodeType>(`/codes/${id}`).then(res => res.data)
)

export const fetchCodes = () => (
    secretContracts.get<Array<CodeType>>(`/codeswithcontracts`).then(res => res.data)
)

export const fetchCodeByContractAddress = (address: string) => (
    secretContracts.get<CodeType>(`/codeswithcontracts/contractAddress/${address}`).then(res => res.data)
)

export const verifyAttempt = (codeId: number, zipData: FormData) => (
    secretContracts.post<VerifyResponseType>(`/codes/verify/${codeId}`, zipData, {
        headers: {
            'Content-Type': 'multipart/form-data'
            // 'Content-Type': 'application/json'
        }
    }).then(res => res.data)
)