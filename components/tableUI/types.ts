// Al menos una columna tiene que tener el uid: 'id'
export interface Column {
  name: string;
  uid: string;
  columnType: ColumnType;
  // filterSearch se agrega a la columna que va a ser filtrada por el input de buscar
  filterSearch?: boolean; //1 y solo 1 columna tiene que tener `filterSearch` para que la tabla se renderice correctamente
  // sortDirection se agrega a la columna que va a tener el orden por defecto
  sortDirection?: 'ascending' | 'descending'; //1 y solo 1 columna tiene que tener `sortDirection` para que la tabla se renderice correctamente
  info?: string;
  visible?: boolean;
  imageHeight?: number;
  renderCell?: (item: any) => JSX.Element;
}

export interface AddButton {
  label: string;
  onClick: any;
}

type ColumnType = 'default' | 'copy' | 'user' | 'date' | 'country' | 'chips' | 'role' | 'status' | 'image' | 'actions' | 'custom-actions';
