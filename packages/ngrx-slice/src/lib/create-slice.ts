import {createFeatureSelector, ActionCreator} from '@ngrx/store';
import type { Draft } from 'immer';
import { createSliceActions } from './create-slice-actions';
import { createSliceReducer } from './create-slice-reducer';
import { createSliceSelectors } from './create-slice-selectors';
import type {
  NamespacedSlice,
  PayloadAction,
  Slice,
  SliceCaseReducers,
  SliceOptions,
} from './typings';
import { classify } from './utils';

function defaultSliceActionNameGetter(
  featureName: string,
  actionName: string
): string {
  return `[${classify(featureName)}] ${actionName}`;
}

export function noopReducer<
  ActionProps = false,
  SliceState = any
>(): ActionProps extends false
  ? (state: Draft<SliceState>) => void
  : (state: Draft<SliceState>, action: PayloadAction<ActionProps>) => void {
  return (() => {}) as unknown as ActionProps extends false
    ? (state: Draft<SliceState>) => void
    : (state: Draft<SliceState>, action: PayloadAction<ActionProps>) => void;
}

export function createSlice<
  SliceState extends object,
  SliceName extends string = string,
  CaseReducers extends SliceCaseReducers<SliceState> = SliceCaseReducers<SliceState>
>({
  name,
  initialState,
  reducers,
  extraReducers,
  reducersToActions,
  sliceActionNameGetter = defaultSliceActionNameGetter,
}: SliceOptions<SliceName, SliceState, CaseReducers>): Slice<
  SliceState,
  SliceName,
  CaseReducers
> {
  const featureSelector = createFeatureSelector<SliceState>(name);

  const nestedSelectors = createSliceSelectors<SliceState>(
    initialState,
    featureSelector
  );

  const actions = createSliceActions<SliceState, SliceName, CaseReducers>(
    name,
    sliceActionNameGetter,
    reducers,
    reducersToActions
  );

  const reducer = createSliceReducer<SliceState, SliceName, CaseReducers>(
    initialState,
    actions,
    reducers,
    extraReducers
  );

  return {
    name,
    reducer,
    actions,
    selectors: {
      [`select${classify(name)}State`]: featureSelector,
      ...nestedSelectors,
    } as Slice<SliceState, SliceName, CaseReducers>['selectors'],
  };
}

export function createNamespacedSlice<
  SliceState extends object,
  SliceName extends string = string,
  CaseReducers extends SliceCaseReducers<SliceState> = SliceCaseReducers<SliceState>
>({
  name,
  initialState,
  reducers,
  extraReducers,
  reducersToActions,
  sliceActionNameGetter = defaultSliceActionNameGetter,
}: SliceOptions<SliceName, SliceState, CaseReducers>): NamespacedSlice<
  SliceState,
  SliceName,
  CaseReducers
> {
  const {
    name: sliceName,
    reducer,
    selectors,
    actions,
  } = createSlice({
    name,
    initialState,
    reducers,
    extraReducers,
    reducersToActions,
    sliceActionNameGetter,
  });

  const classifiedName = classify(name);

  return {
    [`${classifiedName}Feature`]: {
      name: sliceName,
      reducer,
    },
    [`${classifiedName}Actions`]: actions,
    [`${classifiedName}Selectors`]: selectors,
  } as NamespacedSlice<SliceState, SliceName, CaseReducers>;
}
