import Image from 'next/image'
import { useState, useEffect, ThHTMLAttributes, TdHTMLAttributes, Fragment } from 'react'

import { FieldValues, useForm } from 'react-hook-form'

import EmptyImg from 'assets/images/backgrounds/empty-table.png'
import { useDebouncedCallback } from 'hooks/useDebounce'

import { TColors } from './Colors/TColors'
import InputField from './Forms/Input/InputField'
import PdvButton from './PdvButton'
import PdvPagination, { usePdvPagination } from './PdvPagination'

type TPdvDatatable<T> = {
  columns: IColumns<T>[]
  dataSource: T[]
  defaultPagination?: boolean
  pagination?: {
    count: number
    page: number
    onChange: (event: React.ChangeEvent<unknown>, value: number) => void
  }
  paginationColor?: TColors
  limit?: number
  expandedRows?: TExpandedRows<T>
  headerColor?: TColors
  className?: string
}

export interface IColumns<T> {
  name: string
  dataIndex: keyof T
  sortable?: boolean
  filterable?: boolean
  align?: ThHTMLAttributes<T>['align'] | TdHTMLAttributes<T>['align']
  width?: string | number
  render?: (value: T[keyof T], record: T, array: T[]) => React.ReactNode
  customFilter?: () => React.ReactNode
}

export interface TExpandedRows<T> {
  autoCollapse: boolean
  expandedRowRender: (record: T) => React.ReactNode
  rowExpandable: (record: T) => boolean
}

const cleanString = (str: string) => {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replaceAll(' ', '')
}

const PdvDatatable = <T,>(props: TPdvDatatable<T>) => {
  const { defaultPagination = true, headerColor = 'primary-color', paginationColor = 'primary-color' } = props
  const pagination = usePdvPagination()
  const defaultFilterInputValues = props.columns.reduce((acc, item) => (item.filterable ? { ...acc, [item.dataIndex]: '' } : { ...acc }), {})

  const { inputControl, filteredData } = useTableFilters(props.dataSource, defaultFilterInputValues)
  const { currentPageRecords, totalPages, calculateTotalPages } = useTablePagination(filteredData, pagination.page, props.limit)

  const { isRecordExpanded, toggleExpand } = useExpandableRows({
    dataSource: props.dataSource,
    key: props.columns[0].dataIndex,
    autoCollapse: !!props.expandedRows?.autoCollapse
  })

  const isFilterableColumns = props.columns.some((column) => column.filterable || column.customFilter !== undefined)

  const setBgColor = (index: number) => ((index + 1) % 2 === 0 ? 'bg-gray-25 border-y border-gray-100 ' : '')

  const onChangePage = props?.pagination?.onChange !== undefined ? props.pagination.onChange : pagination.onChange

  return (
    <>
      <div className={`overflow-x-auto ${props?.className ?? ''}`}>
        <table className="w-full table-auto">
          <thead>
            <tr>
              {props?.expandedRows && <th style={{ backgroundColor: `var(--${headerColor})`, width: '5%' }} />}

              {props.columns.map((column) => (
                <th
                  key={column.name}
                  align={column.align || 'left'}
                  className="break-words"
                  style={{ backgroundColor: `var(--${headerColor})`, width: column.width ?? 'auto' }}
                >
                  <div className={`${headerColor} py-4 px-6`}>
                    <p className={`subtitle1 font-bold text-white`}>{column.name}</p>
                  </div>
                </th>
              ))}
            </tr>

            <tr>
              {isFilterableColumns &&
                props.columns.map((column) => (
                  <th key={`filter-${column.name}`} className="bg-gray-50">
                    <div className="py-4 px-6">
                      {column.filterable && column.customFilter === undefined && (
                        <InputField
                          name={column.dataIndex as string}
                          form={inputControl}
                          className="w-full"
                          inputProps={{ placeholder: 'Buscar..', className: 'text-gray-500 h-9' }}
                        />
                      )}

                      {column.customFilter && column.customFilter()}
                    </div>
                  </th>
                ))}
            </tr>
          </thead>
          <tbody>
            {!props.dataSource.length ? (
              <tr>
                <td colSpan={props.columns.length}>
                  <EmptyTable />
                </td>
              </tr>
            ) : (
              currentPageRecords.map((record, index: number) => {
                return (
                  <Fragment key={index}>
                    <tr className={`w-full  ${setBgColor(index)}`}>
                      {props?.expandedRows && (
                        <td className="px-4 py-2" width={30}>
                          {props?.expandedRows?.rowExpandable(record) && (
                            <PdvButton
                              className="cursor-pointer"
                              color="blue-400"
                              variant="default"
                              icon={`${isRecordExpanded(record, index) ? 'KeyArrowUp' : 'KeyArrowDown'}`}
                              onClick={() => toggleExpand(record, index)}
                            />
                          )}
                        </td>
                      )}
                      {props.columns.map((column, index) => (
                        <td
                          key={`${record[column.dataIndex]}-${column.name}-${index}`}
                          align={column.align || 'left'}
                          className={`subtitle2 break-words py-4 px-6 font-normal text-gray-500`}
                          style={{ width: column.width ?? 'auto' }}
                        >
                          {column.render ? column.render(record[column.dataIndex], record, props.dataSource) : record[column.dataIndex]}
                        </td>
                      ))}
                    </tr>
                    <tr className="w-full">
                      {props?.expandedRows && props?.expandedRows?.rowExpandable(record) && isRecordExpanded(record, index) && (
                        <td colSpan={props.columns.length + 1} className={`w-full border-y border-gray-100 p-4`}>
                          {props?.expandedRows?.expandedRowRender(record)}
                        </td>
                      )}
                    </tr>
                  </Fragment>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {!props.pagination && defaultPagination && !!currentPageRecords.length && (
        <PdvPagination className="my-6 flex justify-end" count={totalPages} page={pagination.page} onChange={pagination.onChange} />
      )}

      {props.pagination && !!currentPageRecords.length && (
        <>
          <PdvPagination
            className="my-6 flex justify-end"
            count={calculateTotalPages(props.pagination.count)}
            page={props.pagination.page}
            onChange={(_, page: number) => onChangePage(_, page)}
            color={paginationColor}
          />
        </>
      )}
    </>
  )
}

const EmptyTable = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-4 overflow-hidden bg-sky-50 py-5">
      <div className="pr-32">
        <Image src={EmptyImg} alt="Tabla sin datos" width={1045} height={348} quality={100} />
      </div>

      <span className="rounded-md bg-rose-350 p-2 text-center text-white">¡Ups! No se encontraron datos</span>
    </div>
  )
}

const useExpandableRows = <T,>({ dataSource, key, autoCollapse = false }: { dataSource: T[]; key: keyof T; autoCollapse: boolean }) => {
  const [expandedRows, setExpandedRows] = useState<{ key: string; expanded: boolean }[]>([])

  const isRecordExpanded = (record: T, index: number) => !!expandedRows.find((row) => row.key === `${record[key]}-${index}`)?.expanded

  const toggleExpand = (record: T, index: number) => {
    setExpandedRows(
      expandedRows.map((row) => {
        let updatedRow = autoCollapse ? { ...row, expanded: false } : { ...row }

        if (row.key === `${record[key]}-${index}`) updatedRow = { ...row, expanded: !row.expanded }

        return updatedRow
      })
    )
  }

  const createKeys = (data: T[]) => setExpandedRows(data.map((item, index) => ({ key: `${item[key]}-${index}`, expanded: false })))

  useEffect(() => {
    createKeys(dataSource)
  }, [])

  return { isRecordExpanded, toggleExpand }
}

const useTableFilters = <T,>(dataSource: T[], defaultValues: FieldValues) => {
  const filtersControl = useForm<FieldValues>({ defaultValues })
  const [filteredData, setFilteredData] = useState(dataSource)

  const handleFilter = useDebouncedCallback((value: string, values: FieldValues) => {
    const isAllEmpty = Object.values(values).every((value) => value === '')
    if (isAllEmpty) return setFilteredData(dataSource)

    let matchFilter = filteredData
    Object.entries(values).forEach(([key, value]) => {
      matchFilter = matchFilter.filter((record) => cleanString(record[key as keyof T] as unknown as string).includes(cleanString(value)))
    })
    setFilteredData(matchFilter)
  }, 500)

  useEffect(() => {
    const subscription = filtersControl.watch((values, { name }) => {
      handleFilter(name !== undefined ? values[name] : '', values)
    })

    return () => subscription.unsubscribe()
  }, [filtersControl.watch])

  useEffect(() => setFilteredData(dataSource), [dataSource])

  return { inputControl: filtersControl, filteredData }
}

export const useDynamicTableFilters = (values: FieldValues, onChangeCallback?: (inputs: Record<string, string>) => void) => {
  const filterValues: FieldValues = Object.keys(values).reduce((acc, key) => ({ ...acc, [key]: '' }), {})

  const filtersControl = useForm({ defaultValues: filterValues })

  const [filters, setFilters] = useState(filterValues)

  const [parsedFilters, setParsedFilters] = useState({})

  useEffect(() => {
    setParsedFilters(transformValues(values, filters))
  }, [filters])

  const handleFilters = useDebouncedCallback((inputs: Record<string, string>) => {
    if (onChangeCallback) onChangeCallback(inputs)

    setFilters({
      ...filters,
      ...inputs
    })
  }, 500)

  const transformValues = (object: Record<string, unknown>, values: Record<string, unknown>) => {
    return Object.entries(object).reduce((acc, [value, key]) => ({ ...acc, [key as string]: values[value] }), {})
  }

  useEffect(() => {
    const subscription = filtersControl.watch((inputValues) => handleFilters(inputValues))

    return () => subscription.unsubscribe()
  }, [filtersControl.watch])

  return {
    inputFilterControl: filtersControl,
    filters: parsedFilters,
    handleFilters
  }
}

const useTablePagination = <T,>(dataSource: T[], currentPage: number, limit: number | undefined) => {
  const recordsPerPage = limit ?? 10

  const paginatedData = (data: T[], page: number, pageSize = recordsPerPage) => {
    const paginated = data.slice((page - 1) * pageSize, page * pageSize)
    return paginated.length ? paginated : data
  }

  const calculateTotalPages = (totalRecords: number) => Math.ceil(totalRecords / recordsPerPage)

  const currentPageRecords = paginatedData(dataSource, currentPage)

  return { currentPageRecords, totalPages: calculateTotalPages(dataSource.length), calculateTotalPages }
}

export default PdvDatatable
