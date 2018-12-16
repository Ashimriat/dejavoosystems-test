interface FieldInfo {
  id: number
  key: string
  name: string
  order: number
  type: number
  visible: boolean
}

interface PeriodInfo {
  currentDate, displayBy, firstDate, lastDate, oldFirstDate, oldLastDate, stringPeriod: string
  period: number
}

interface CellValue {
  id: number
  value: number | string
}

export interface TotalCellValue {
  id: number
  value: number
}

interface Legend {
  name: string
  color: string
}

interface Plot {
  id, domainField, legendField, legendFieldType, value, valueField, valueFieldType: number
  key: string
  name: string
  legends: Array<Legend>
}

interface ViewSettings {
  defaultField, defaultPlot: number
  plots: Array<Plot>
}

export interface SubRow {
  fields: Array<CellValue>
}

interface CardRow {
  fields: Array<CellValue>
  subRows: Array<SubRow>
}

interface SummaryRow {
  extData, fields, hostData, oldData: Array<CellValue>
  subRows: Array<SubRow>
}

export interface CardData {
  fieldsInfo?: Array<FieldInfo>
  periodInfo?: PeriodInfo
  rows?: Array<CardRow>
  totals?: Array<CellValue>
  viewSettings?: ViewSettings
}

export interface SummaryData {
  fieldsInfo?: Array<FieldInfo>
  periodInfo?: PeriodInfo
  rows?: Array<SummaryRow>
  totals?: Array<TotalCellValue>
  viewSettings?: ViewSettings
}

export interface ChartData {
  labels?: Array<string>
  datasets?: Array<{
    type?: string
    label?: string
    data: Array<number | string>
    backgroundColor: Array<string> | string
    hoverBackgroundColor: Array<string> | string
  }>
}

interface AppInfo {
  id: number
  name: string
  values: Array<string | number>
}

export interface TransactionsTableData {
  titleCell: FieldInfo
  extData: Array<CellValue>
  hostData: Array<CellValue>
  oldData: Array<CellValue>
  fields: Array<CellValue>
}

export interface AppData {
  name: string
  color: string
  amounts: AppInfo
  transactions: AppInfo
  tips: AppInfo
  fees: AppInfo
}