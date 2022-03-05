import { format } from 'date-fns';
import ptBr from 'date-fns/locale/pt-BR';

const formatDate = (date: number | Date): string => {
  return format(date, 'dd MMM yyyy', { locale: ptBr });
};

export { formatDate };
