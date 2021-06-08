import { secretContracts } from "./axiosInstances";

type ContractType = {
    address: string
    codeId: number
    label: string
    creator: string
}

type CodeType = {
    id: number
    isVerified: boolean
    creator: string
    checksum: string
    source?: string
    builder?: 'enigmampc/secret-contract-optimizer:1.0.0' | 'enigmampc/secret-contract-optimizer:1.0.1' | 'enigmampc/secret-contract-optimizer:1.0.2' | 'enigmampc/secret-contract-optimizer:1.0.3' | 'enigmampc/secret-contract-optimizer:1.0.4'
}

export const getContractByAddress = (address: string) => (
    secretContracts.get<ContractType>(`/contracts/${address}`)
)

export const getContractsByCodeID = (codeID: string | number) => (
    secretContracts.get<Array<ContractType>>(`/contracts/codeID/${codeID}`)
)

export const getCode = (id: string | number) => (
    secretContracts.get<CodeType>(`/codes/${id}`)
)

export const getCodes = () => (
    secretContracts.get<Array<CodeType>>(`/codes`)
)