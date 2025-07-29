export interface Column {
  name: string;
  uid: string;
  columnType: ColumnType;
  filterSearch?: true; //1 y solo 1 columna tiene que tener `filterSearch` para que la tabla se renderice correctamente
  sortDirection?: 'ascending' | 'descending'; //1 y solo 1 columna tiene que tener `sortDirection` para que la tabla se renderice correctamente
  info?: string;
}

type ColumnType = 'default' | 'copy' | 'user' | 'date' | 'country' | 'chips' | 'role' | 'status' | 'actions' | 'itinerary-actions';
