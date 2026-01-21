'use client';
//to paginate we ll use tne next js router functionalities 2:11:10 =>since we re using the router 
  // ==>browser client side functionalitites
//2:07:07
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { useRouter } from 'next/navigation';
import { buildPageNumbers, cn, ELLIPSIS } from '@/lib/utils';

//2:10:50 accept all of the params needed to make the pagination work
const CoinsPagination = ({ currentPage, totalPages, hasMorePages }: Pagination) => {

  const router = useRouter(); //to paginate we ll use tne next js router functionalities 2:11:10 =>since we re using the router 
  // ==>browser client side functionalitites

  //we ll paginate by changin the url of our website to include the page number  2:11:35
  const handlePageChange = (page: number) => {
    router.push(`/coins?page=${page}`); //call the router push method to navigate to the new corresponding page
  };

  const pageNumbers = buildPageNumbers(currentPage, totalPages);//2:12:00 2:12:14 on wteevr page we re on its gonna provide us with couple of pages before and after it
  //so we can v easily paginate through them

  const isLastPage = !hasMorePages || currentPage === totalPages; //2:12:25 r we on last page?

  return ( //put all of the above variables to use 2:12:45
    <Pagination id="coins-pagination">
      <PaginationContent className="pagination-content">
        <PaginationItem className="pagination-control prev">
          <PaginationPrevious
            onClick={() => currentPage > 1 //check if the current page is greater than 1
                && handlePageChange(currentPage - 1)}
            className={currentPage === 1 ? 'control-disabled' : 'control-button'}
          />
        </PaginationItem>

              {/* Dispaly all of the pages in between 2:15:00 */}
        <div className="pagination-pages">
          {pageNumbers.map((page, index) => ( //map over the page numbers created before
                 //display a pagination item for each
            <PaginationItem key={index}>
              {page === ELLIPSIS ? ( // 1  2 ... 100 
                <span className="ellipsis">...</span>
              ) : (
                <PaginationLink
                  onClick={() => handlePageChange(page)}//pass in the page we wana go to
                  className={cn('page-link', {
                    'page-link-active': currentPage === page,
                  })}
                >
                  {page}
                </PaginationLink>
              )}
            </PaginationItem>
          ))}
        </div>

        <PaginationItem className="pagination-control next">
          <PaginationNext //2:14:16
            onClick={() => !isLastPage && handlePageChange(currentPage + 1)}
            className={isLastPage ? 'control-disabled' : 'control-button'}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

export default CoinsPagination;
