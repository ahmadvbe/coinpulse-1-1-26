//29:30 create a shadcn table
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

const DataTable = <T,>({ 
  //32:40 we make this data table accept 
  // an additional type that we re then passsing over into the data table props
  //passs an additional proop called T into data table props
  //now this file in our entire app knows what type of columns is gonna be , the row key ,...
  //to be used accross our app 33:10

  //this table will be showing different data on different pages 30:05
  //we need to pass the different data into the component to show different data
  //reusability purpose is required  30:15
  //pass all 
        //  the new columns,
        //  the data to fills these columns with, 
        // the row keys function to generate a unique key for each row
  columns,
  data,
  rowKey,
  tableClassName, //optional table className 30:32 in case we wana style it differently
  headerClassName,
  headerRowClassName,
  headerCellClassName, //30:40
  bodyRowClassName, //30:44
  bodyCellClassName,//30:48s
}: DataTableProps<T>) => { //30:58 define tbhe type of all these properties @ coinpulse/type.d.ts
  //d stands for declaration , we wana declare all of our types

  return (
    <Table //33:27 turn this table to be fully reusable 
    //cn : pass multiple classnames into it
      className={cn('custom-scrollbar', tableClassName)}>
      <TableHeader 
                className={headerClassName}>
        <TableRow 
                  className={cn('hover:bg-transparent!', headerRowClassName)}>
                    
          {columns.map((column, i) => (   
            //map over all the columns toe be passed dynamically through props 34:30
            <TableHead //rendering the column.header info
              key={i}// needs a key since we re mapping over it 35:13s
              className={cn( //provide multiple classNames
                'bg-dark-400 text-purple-100 py-4 first:pl-5 last:pr-5',
                headerCellClassName,//1:56:20
                column.headClassName,
              )}
            >
              {column.header} 
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody //36:10 map over the data
        >
        {data.map((row, rowIndex) => ( //get each row and its index
          <TableRow //for each one auto return a tablerow
            key={rowKey(row, rowIndex)} 
                //since we re mapping over our table rows we hve to pass a key 36:58
                //to make it super unique we pass it into the rowKey func
            className={cn( //37:10 provide diff classsNames
              'overflow-hidden rounded-lg border-b border-purple-100/5 hover:bg-dark-400/30! relative',
              bodyRowClassName, //37:40 this one is gonna be unique depending on wt we passs in props
            )}
          >
            {columns.map((column, columnIndex) => ( //each tableRow will also map over the columns 36:25
              <TableCell //where we ll display a Tablecell 36:30 rendering the content
                key={columnIndex} //37:57
                className={cn('py-4 first:pl-5 last:pr-5', //38:02
                         bodyCellClassName, //1:56:40
                         column.cellClassName)}
              >
                {/* //where we ll display a Tablecell 36:30 rendering the content
                //pass the data for the row and row index 36:39 */}
                {column.cell(row, rowIndex)} 
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default DataTable;
