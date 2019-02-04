/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */
import { getOr } from 'lodash/fp';
import * as React from 'react';
import { pure } from 'recompose';
import styled from 'styled-components';
import { StaticIndexPattern } from 'ui/index_patterns';

import { TimelineQuery } from '../../containers/timeline';
import { Direction } from '../../graphql/types';
import { AutoSizer } from '../auto_sizer';
import { Body } from './body';
import { ColumnHeader } from './body/column_headers/column_header';
import { RowRenderer } from './body/renderers';
import { ColumnRenderer } from './body/renderers';
import { Sort } from './body/sort';
import { DataProvider } from './data_providers/data_provider';
import {
  OnChangeDataProviderKqlQuery,
  OnChangeDroppableAndProvider,
  OnChangeItemsPerPage,
  OnColumnSorted,
  OnDataProviderRemoved,
  OnFilterChange,
  OnRangeSelected,
  OnToggleDataProviderEnabled,
  OnToggleDataProviderExcluded,
} from './events';
import { Footer, footerHeight } from './footer';
import { TimelineHeader } from './header/timeline_header';
import { calculateBodyHeight, combineQueries } from './helpers';

interface Props {
  columnHeaders: ColumnHeader[];
  columnRenderers: ColumnRenderer[];
  dataProviders: DataProvider[];
  flyoutHeaderHeight: number;
  flyoutHeight: number;
  id: string;
  indexPattern: StaticIndexPattern;
  itemsPerPage: number;
  itemsPerPageOptions: number[];
  kqlQuery: string;
  onChangeDataProviderKqlQuery: OnChangeDataProviderKqlQuery;
  onChangeDroppableAndProvider: OnChangeDroppableAndProvider;
  onChangeItemsPerPage: OnChangeItemsPerPage;
  onColumnSorted: OnColumnSorted;
  onDataProviderRemoved: OnDataProviderRemoved;
  onFilterChange: OnFilterChange;
  onRangeSelected: OnRangeSelected;
  onToggleDataProviderEnabled: OnToggleDataProviderEnabled;
  onToggleDataProviderExcluded: OnToggleDataProviderExcluded;
  range: string;
  rowRenderers: RowRenderer[];
  show: boolean;
  sort: Sort;
}

const WrappedByAutoSizer = styled.div`
  width: auto;
`; // required by AutoSizer

/** The parent Timeline component */
export const Timeline = pure<Props>(
  ({
    columnHeaders,
    columnRenderers,
    dataProviders,
    flyoutHeaderHeight,
    flyoutHeight,
    id,
    indexPattern,
    itemsPerPage,
    itemsPerPageOptions,
    kqlQuery,
    onChangeDataProviderKqlQuery,
    onChangeDroppableAndProvider,
    onChangeItemsPerPage,
    onColumnSorted,
    onDataProviderRemoved,
    onFilterChange,
    onRangeSelected,
    onToggleDataProviderEnabled,
    onToggleDataProviderExcluded,
    range,
    rowRenderers,
    show,
    sort,
  }) => {
    const combinedQueries = combineQueries(dataProviders, indexPattern, kqlQuery);
    return (
      <>
        <AutoSizer detectAnyWindowResize={true} content>
          {({ measureRef, content: { height: timelineHeaderHeight = 0 } }) => (
            <>
              <WrappedByAutoSizer innerRef={measureRef}>
                <TimelineHeader
                  columnHeaders={columnHeaders}
                  id={id}
                  indexPattern={indexPattern}
                  dataProviders={dataProviders}
                  onChangeDataProviderKqlQuery={onChangeDataProviderKqlQuery}
                  onChangeDroppableAndProvider={onChangeDroppableAndProvider}
                  onColumnSorted={onColumnSorted}
                  onDataProviderRemoved={onDataProviderRemoved}
                  onFilterChange={onFilterChange}
                  onRangeSelected={onRangeSelected}
                  onToggleDataProviderEnabled={onToggleDataProviderEnabled}
                  onToggleDataProviderExcluded={onToggleDataProviderExcluded}
                  range={range}
                  show={show}
                  sort={sort}
                />
              </WrappedByAutoSizer>

              <div data-test-subj="timeline">
                {combinedQueries != null ? (
                  <TimelineQuery
                    sourceId="default"
                    limit={itemsPerPage}
                    filterQuery={combinedQueries.filterQuery}
                    sortField={{
                      sortFieldId: sort.columnId,
                      direction: sort.sortDirection as Direction,
                    }}
                  >
                    {({ events, loading, totalCount, pageInfo, loadMore, updatedAt }) => (
                      <>
                        <Body
                          id={id}
                          columnHeaders={columnHeaders}
                          columnRenderers={columnRenderers}
                          data={events}
                          height={calculateBodyHeight({
                            flyoutHeight,
                            flyoutHeaderHeight,
                            timelineHeaderHeight,
                            timelineFooterHeight: footerHeight,
                          })}
                          rowRenderers={rowRenderers}
                        />
                        <Footer
                          dataProviders={dataProviders}
                          serverSideEventCount={totalCount}
                          hasNextPage={getOr(false, 'hasNextPage', pageInfo)!}
                          height={footerHeight}
                          isLoading={loading}
                          itemsCount={events.length}
                          itemsPerPage={itemsPerPage}
                          itemsPerPageOptions={itemsPerPageOptions}
                          onChangeItemsPerPage={onChangeItemsPerPage}
                          onLoadMore={loadMore}
                          nextCursor={getOr(null, 'endCursor.value', pageInfo)!}
                          tieBreaker={getOr(null, 'endCursor.tiebreaker', pageInfo)!}
                          updatedAt={updatedAt}
                        />
                      </>
                    )}
                  </TimelineQuery>
                ) : null}
              </div>
            </>
          )}
        </AutoSizer>
      </>
    );
  }
);