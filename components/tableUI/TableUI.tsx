'use client';

import type { Selection, SortDescriptor } from '@heroui/react';
import type { Key } from '@react-types/shared';

import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
  Button,
  RadioGroup,
  Radio,
  Chip,
  Pagination,
  Tooltip,
  useButton,
  User,
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@heroui/react';
import { SearchIcon } from '@heroui/shared-icons';
import React, { useMemo, useRef, useCallback, useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { cn } from '@heroui/react';
import Link from 'next/link';
import { Status } from './Status';
import { StatusOptions } from './mockData';
import { Modal, useModal } from '@/components/ui/modal';
import { AddItineraryModal } from '@/components/itinerary/add-itinerary-modal';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';

import { useMemoizedCallback } from './use-memoized-callback';

import { CopyText } from './copy-text';
import { EyeFilledIcon } from './eye';
import { EditLinearIcon } from './edit';
import { DeleteFilledIcon } from './delete';
import { ArrowDownIcon } from './arrow-down';
import { ArrowUpIcon } from './arrow-up';

import { Column } from './tableInterfaces';

export default function TableUI({ 
  columns, 
  data, 
  title, 
  buttonsAdd, 
  onDataChange 
}: { 
  columns: Column[]
  data: any[]
  title: string
  buttonsAdd: string[]
  onDataChange?: (newData: any[]) => void
}) {
  const [filterValue, setFilterValue] = useState('');
  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set([]));
  const [visibleColumns, setVisibleColumns] = useState<Selection>(new Set(columns.map((col) => col.uid)));
  const [rowsPerPage] = useState(10);
  const [page, setPage] = useState(1);
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: 'memberInfo',
    direction: 'ascending',
  });

  const [workerTypeFilter, setWorkerTypeFilter] = React.useState('all');
  const [startDateFilter, setStartDateFilter] = React.useState('all');

  // Modal state para agregar itinerario
  const { isOpen: isAddModalOpen, openModal: openAddModal, closeModal: closeAddModal } = useModal();

  // Effect para detectar cambios en data prop
  useEffect(() => {
    // Log removido para limpiar código
  }, [data]);

  const filterColumns = columns.filter((col) => col.filterSearch);
  if (filterColumns.length > 1) {
    console.warn('Más de una columna tiene filterSearch: true. Se usará solo la primera:', filterColumns[0].uid);
  }

  const filterColumn = filterColumns[0]?.uid;

  const headerColumns = useMemo(() => {
    if (visibleColumns === 'all') return columns;

    return columns
      .map((item) => {
        if (item.uid === sortDescriptor.column) {
          return {
            ...item,
            sortDirection: sortDescriptor.direction,
          };
        }

        return item;
      })
      .filter((column) => Array.from(visibleColumns).includes(column.uid));
  }, [visibleColumns, sortDescriptor]);

  const itemFilter = useCallback(
    (col: any) => {
      let allWorkerType = workerTypeFilter === 'all';
      let allStartDate = startDateFilter === 'all';

      return (
        (allWorkerType || workerTypeFilter === col.representative.toLowerCase()) &&
        (allStartDate ||
          new Date(new Date().getTime() - +(startDateFilter.match(/(\d+)(?=Days)/)?.[0] ?? 0) * 24 * 60 * 60 * 1000) <= new Date(col.startDate))
      );
    },
    [startDateFilter, workerTypeFilter]
  );

  const filteredItems = useMemo(() => {
    let filteredUsers = [...data];

    if (filterValue && filterColumn) {
      filteredUsers = filteredUsers.filter((row) =>
        String(row[filterColumn as keyof typeof row])
          .toLowerCase()
          .includes(filterValue.toLowerCase())
      );
    }

    filteredUsers = filteredUsers.filter(itemFilter);

    return filteredUsers;
  }, [filterValue, itemFilter]);

  const pages = Math.ceil(filteredItems.length / rowsPerPage) || 1;

  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return filteredItems.slice(start, end);
  }, [page, filteredItems, rowsPerPage]);

  const sortedItems = useMemo(() => {
    return [...items].sort((a: any, b: any) => {
      const col = sortDescriptor.column;

      let first = a[col];
      let second = b[col];

      const cmp = first < second ? -1 : first > second ? 1 : 0;

      return sortDescriptor.direction === 'descending' ? -cmp : cmp;
    });
  }, [sortDescriptor, items]);

  const filterSelectedKeys = useMemo(() => {
    if (selectedKeys === 'all') return selectedKeys;
    let resultKeys = new Set<Key>();

    if (filterValue) {
      filteredItems.forEach((item) => {
        const stringId = String(item.id);

        if ((selectedKeys as Set<string>).has(stringId)) {
          resultKeys.add(stringId);
        }
      });
    } else {
      resultKeys = selectedKeys;
    }

    return resultKeys;
  }, [selectedKeys, filteredItems, filterValue]);

  const eyesRef = useRef<HTMLButtonElement | null>(null);
  const editRef = useRef<HTMLButtonElement | null>(null);
  const deleteRef = useRef<HTMLButtonElement | null>(null);
  const { getButtonProps: getEyesProps } = useButton({ ref: eyesRef });
  const { getButtonProps: getEditProps } = useButton({ ref: editRef });
  const { getButtonProps: getDeleteProps } = useButton({ ref: deleteRef });
  const getMemberInfoProps = useMemoizedCallback(() => ({
    onClick: handleMemberClick,
  }));

  const renderCell = useMemoizedCallback((user: any, columnKey: React.Key) => {
    const userKey = columnKey as string;
    const cellValue = user[userKey as any] as string;
    const column = columns.find((col) => col.uid === userKey);
    const type = column?.columnType ?? 'default';

    switch (type) {
      case 'copy':
        return <CopyText>{cellValue}</CopyText>;
      case 'user':
        return (
          <User
            avatarProps={{ radius: 'lg', src: user[userKey].avatar }}
            classNames={{
              name: 'text-default-foreground',
              description: 'text-default-500',
            }}
            description={user[userKey].email}
            name={user[userKey].name}
          >
            {user[userKey].email}
          </User>
        );
      case 'date':
        return (
          <div className="flex items-center gap-1">
            <Icon className="h-[16px] w-[16px] text-default-300" icon="solar:calendar-minimalistic-linear" />
            <p className="text-nowrap text-small text-default-foreground">
              {new Intl.DateTimeFormat('es-MX', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              }).format(cellValue as unknown as Date)}
            </p>
          </div>
        );
      case 'chips':
        return (
          <div className="float-start flex gap-1">
            {user[userKey].map((team: any, index: any) => {
              if (index < 3) {
                return (
                  <Chip key={team} className="rounded-xl bg-default-100 px-[6px] capitalize text-default-800" size="sm" variant="flat">
                    {team}
                  </Chip>
                );
              }
              if (index < 4) {
                return (
                  <Chip key={team} className="text-default-500" size="sm" variant="flat">
                    {`+${team.length - 3}`}
                  </Chip>
                );
              }

              return null;
            })}
          </div>
        );
      case 'role':
        return <div className="text-nowrap text-small capitalize text-default-foreground">{cellValue}</div>;
      case 'status':
        return <Status status={cellValue as StatusOptions} />;
      case 'actions':
        return (
          <div className="flex items-center justify-end gap-2">
            <EyeFilledIcon {...getEyesProps()} className="cursor-pointer text-default-400" height={18} width={18} />
            <EditLinearIcon {...getEditProps()} className="cursor-pointer text-default-400" height={18} width={18} />
            <DeleteFilledIcon {...getDeleteProps()} className="cursor-pointer text-default-400" height={18} width={18} />
          </div>
        );
      case 'itinerary-actions':
        return (
          <div className="flex items-center justify-end gap-2">
            <Button
              size="sm"
              color={user.status === 'Activo' ? 'danger' : 'success'}
              variant="flat"
              onPress={() => handleToggleStatus(user.id, user.status === 'Activo')}
              startContent={
                user.status === 'Activo' ? 
                  <Icon icon="solar:eye-closed-linear" width={16} height={16} /> : 
                  <Icon icon="solar:eye-linear" width={16} height={16} />
              }
            >
              {user.status === 'Activo' ? 'Desactivar' : 'Activar'}
            </Button>
            <Button
              as={Link}
              href={`/itinerary/${user.id}`}
              size="sm"
              color="primary"
              variant="flat"
              startContent={<EyeFilledIcon height={16} width={16} />}
            >
              Ver detalles
            </Button>
          </div>
        );
      default:
        return cellValue;
    }
  });

  const onNextPage = useMemoizedCallback(() => {
    if (page < pages) {
      setPage(page + 1);
    }
  });

  const onPreviousPage = useMemoizedCallback(() => {
    if (page > 1) {
      setPage(page - 1);
    }
  });

  const onSearchChange = useMemoizedCallback((value?: string) => {
    if (value) {
      setFilterValue(value);
      setPage(1);
    } else {
      setFilterValue('');
    }
  });

  const onSelectionChange = useMemoizedCallback((keys: Selection) => {
    if (keys === 'all') {
      if (filterValue) {
        const resultKeys = new Set(filteredItems.map((item) => String(item.id)));

        setSelectedKeys(resultKeys);
      } else {
        setSelectedKeys(keys);
      }
    } else if (keys.size === 0) {
      setSelectedKeys(new Set());
    } else {
      const resultKeys = new Set<Key>();

      keys.forEach((v) => {
        resultKeys.add(v);
      });
      const selectedValue = selectedKeys === 'all' ? new Set(filteredItems.map((item) => String(item.id))) : selectedKeys;

      selectedValue.forEach((v) => {
        if (items.some((item) => String(item.id) === v)) {
          return;
        }
        resultKeys.add(v);
      });
      setSelectedKeys(new Set(resultKeys));
    }
  });

  const topContent = useMemo(() => {
    return (
      <div className="flex items-center gap-4 overflow-auto px-[6px] py-[4px]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-4">
            <Input
              className="min-w-[200px]"
              endContent={<SearchIcon className="text-default-400" width={16} />}
              placeholder={`Filtrar por ${filterColumns[0]?.name.toLowerCase()}`}
              size="sm"
              value={filterValue}
              onValueChange={onSearchChange}
            />
            <div>
              <Popover placement="bottom">
                <PopoverTrigger>
                  <Button
                    className="bg-default-100 text-default-800"
                    size="sm"
                    startContent={<Icon className="text-default-400" icon="solar:tuning-2-linear" width={16} />}
                  >
                    Filtros
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="flex w-full flex-col gap-6 px-2 py-4">
                    <RadioGroup label="Worker Type" value={workerTypeFilter} onValueChange={setWorkerTypeFilter}>
                      <Radio value="all">Todos</Radio>
                      {/* TODO: AGREGAR LAS OPCIONES DINÁMICAMENTE */}
                    </RadioGroup>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Dropdown>
                <DropdownTrigger>
                  <Button
                    className="bg-default-100 text-default-800"
                    size="sm"
                    startContent={<Icon className="text-default-400" icon="solar:sort-linear" width={16} />}
                  >
                    Ordenar
                  </Button>
                </DropdownTrigger>
                <DropdownMenu aria-label="Ordenar" items={headerColumns.filter((c) => !['actions', 'teams'].includes(c.uid))}>
                  {(item) => (
                    <DropdownItem
                      key={item.uid}
                      onPress={() => {
                        setSortDescriptor({
                          column: item.uid,
                          direction: sortDescriptor.direction === 'ascending' ? 'descending' : 'ascending',
                        });
                      }}
                    >
                      {item.name}
                    </DropdownItem>
                  )}
                </DropdownMenu>
              </Dropdown>
            </div>
            {/* TODO: agregar un apartado en donde se visualize el sort de datos */}
            <div>
              <Dropdown closeOnSelect={false}>
                <DropdownTrigger>
                  <Button
                    className="bg-default-100 text-default-800"
                    size="sm"
                    startContent={<Icon className="text-default-400" icon="solar:sort-horizontal-linear" width={16} />}
                  >
                    Columnas
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  disallowEmptySelection
                  aria-label="Columnas"
                  items={columns.filter((c) => !['actions'].includes(c.uid))}
                  selectedKeys={visibleColumns}
                  selectionMode="multiple"
                  onSelectionChange={setVisibleColumns}
                >
                  {(item) => <DropdownItem key={item.uid}>{item.name}</DropdownItem>}
                </DropdownMenu>
              </Dropdown>
            </div>
          </div>

          {(filterSelectedKeys === 'all' || filterSelectedKeys.size > 0) && (
            <div className="whitespace-nowrap text-sm text-default-800">
              {filterSelectedKeys === 'all'
                ? 'Seleccionando todos los elementos'
                : `${filterSelectedKeys.size} ${filterSelectedKeys.size === 1 ? 'seleccionado' : 'seleccionados'}`}
            </div>
          )}

          {(filterSelectedKeys === 'all' || filterSelectedKeys.size > 0) && (
            <Button className="bg-default-100 text-default-800" size="sm" variant="flat">
              Eliminar selección
            </Button>
          )}
        </div>
      </div>
    );
  }, [
    filterValue,
    visibleColumns,
    filterSelectedKeys,
    headerColumns,
    sortDescriptor,
    workerTypeFilter,
    startDateFilter,
    setWorkerTypeFilter,
    setStartDateFilter,
    onSearchChange,
    setVisibleColumns,
  ]);

  const topBar = useMemo(() => {
    return (
      <div className="mb-[18px] flex items-center justify-between">
        <div className="flex w-[226px] items-center gap-2">
          <h1 className="text-2xl font-[700] leading-[32px]">{title}</h1>
          <Chip className="hidden items-center text-default-500 sm:flex" size="sm" variant="flat">
            {data.length}
          </Chip>
        </div>
        <div className="flex gap-3">
          {buttonsAdd.map((label, index) => (
            <Button 
              key={index} 
              color="primary" 
              endContent={<Icon icon="solar:add-circle-bold" width={20} />}
              onPress={() => {
                if (label === 'Nuevo itinerario') {
                  openAddModal()
                }
              }}
            >
              {label}
            </Button>
          ))}
        </div>
      </div>
    );
  }, []);

  const bottomContent = useMemo(() => {
    return (
      <div className="flex flex-col items-center justify-between gap-2 px-2 py-2 sm:flex-row">
        <Pagination isCompact showControls showShadow color="primary" page={page} total={pages} onChange={setPage} />
        <div className="flex items-center justify-end gap-6">
          {(filterSelectedKeys === 'all' || filterSelectedKeys.size > 0) && (
            <span className="text-small text-default-400">
              {filterSelectedKeys === 'all'
                ? 'Seleccionando todos los elementos'
                : `${filterSelectedKeys.size} de ${filteredItems.length} ${filterSelectedKeys.size === 1 ? 'seleccionado' : 'seleccionados'}`}
            </span>
          )}
          <div className="flex items-center gap-3">
            <Button isDisabled={page === 1} size="sm" variant="flat" onPress={onPreviousPage}>
              Anterior
            </Button>
            <Button isDisabled={page === pages} size="sm" variant="flat" onPress={onNextPage}>
              Siguiente
            </Button>
          </div>
        </div>
      </div>
    );
  }, [filterSelectedKeys, page, pages, filteredItems.length, onPreviousPage, onNextPage]);

  const handleMemberClick = useMemoizedCallback(() => {
    setSortDescriptor({
      column: 'memberInfo',
      direction: sortDescriptor.direction === 'ascending' ? 'descending' : 'ascending',
    });
  });

  // Función para manejar cuando se agrega un nuevo itinerario
  const handleItineraryAdded = useCallback((newItinerary: any) => {
    if (onDataChange) {
      // Crear el objeto normalizado como se hace en la página principal
      const createLocalDate = (dateString: string) => {
        const dateParts = dateString.split('T')[0].split('-');
        return new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]));
      };

      const normalizedItinerary = {
        id: newItinerary.id_itinerary,
        title: newItinerary.title,
        destination: newItinerary.destination,
        language: `${newItinerary.language}`.toUpperCase(),
        start_date: createLocalDate(newItinerary.start_date),
        end_date: createLocalDate(newItinerary.end_date),
        status: newItinerary.active ? 'Activo' : 'Inactivo',
      };

      // Agregar el nuevo itinerario y ordenar por fecha de inicio (más recientes primero)
      const updatedData = [normalizedItinerary, ...data].sort((a, b) => {
        return new Date(b.start_date).getTime() - new Date(a.start_date).getTime();
      });
      
      onDataChange(updatedData);
    }
  }, [data, onDataChange]);

  // Función para manejar el cambio de estado (activar/desactivar)
  const handleToggleStatus = useCallback(async (itineraryId: string, isCurrentlyActive: boolean) => {
    try {
      const supabase = createClient();
      const newActiveStatus = !isCurrentlyActive;
      
      // Actualizar en Supabase
      const { error } = await supabase
        .from('itinerary')
        .update({ active: newActiveStatus })
        .eq('id_itinerary', itineraryId);

      if (error) {
        console.error('Error al actualizar estado:', error);
        toast.error('Error al actualizar el estado del itinerario');
        return;
      }

      // Actualizar datos localmente
      const updatedData = data.map(item => 
        item.id === itineraryId 
          ? { ...item, status: newActiveStatus ? 'Activo' : 'Inactivo' }
          : item
      );

      if (onDataChange) {
        onDataChange(updatedData);
      }

      toast.success(`Itinerario ${newActiveStatus ? 'activado' : 'desactivado'} correctamente`);
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      toast.error('Error al actualizar el estado del itinerario');
    }
  }, [data, onDataChange]);

  return (
    <>
      <div className="h-full w-full p-6">
        {topBar}
        <Table
          isHeaderSticky
          aria-label="Example table with custom cells, pagination and sorting"
          bottomContent={bottomContent}
          bottomContentPlacement="outside"
          classNames={{
            td: 'before:bg-transparent',
          }}
          selectedKeys={filterSelectedKeys}
          selectionMode="multiple"
          sortDescriptor={sortDescriptor}
          topContent={topContent}
          topContentPlacement="outside"
          onSelectionChange={onSelectionChange}
          onSortChange={setSortDescriptor}
        >
          <TableHeader columns={headerColumns}>
            {(column) => (
              <TableColumn
                key={column.uid}
                align={column.uid === 'actions' ? 'end' : 'start'}
                className={cn([column.uid === 'actions' ? 'flex items-center justify-end px-[20px]' : ''])}
              >
                {column.uid === 'memberInfo' ? (
                  <div {...getMemberInfoProps()} className="flex w-full cursor-pointer items-center justify-between">
                    {column.name}
                    {column.sortDirection === 'ascending' ? (
                      <ArrowUpIcon className="text-default-400" />
                    ) : (
                      <ArrowDownIcon className="text-default-400" />
                    )}
                  </div>
                ) : column.info ? (
                  <div className="flex min-w-[108px] items-center justify-between">
                    {column.name}
                    <Tooltip content={column.info}>
                      <Icon className="text-default-300" height={16} icon="solar:info-circle-linear" width={16} />
                    </Tooltip>
                  </div>
                ) : (
                  column.name
                )}
              </TableColumn>
            )}
          </TableHeader>
          <TableBody emptyContent={'Sin información disponible'} items={sortedItems}>
            {(item) => <TableRow key={item.id}>{(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}</TableRow>}
          </TableBody>
        </Table>
      </div>

      {/* Modal para agregar itinerario */}
      <Modal 
        isOpen={isAddModalOpen} 
        onClose={closeAddModal}
        title="Crear Nuevo Itinerario"
        size="lg"
      >
        <AddItineraryModal 
          onItineraryAdded={handleItineraryAdded}
          onClose={closeAddModal}
        />
      </Modal>
    </>
  );
}
