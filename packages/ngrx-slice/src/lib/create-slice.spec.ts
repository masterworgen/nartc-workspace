import { createNamespacedSlice, createSlice, noopReducer } from './create-slice';
import type { PayloadAction } from './typings';
import { classify } from './utils';

interface CounterState {
  value: number;
  incremented: number;
  decremented: number;
}

interface MyCounterState {
  value: number;
  incremented: number;
  decremented: number;
}

const initialState: CounterState = {
  decremented: 0,
  incremented: 0,
  value: 0,
};

const { CounterActions, CounterSelectors, CounterFeature } =
  createNamespacedSlice({
    name: 'counter',
    initialState,
    reducers: {
      increment: (state) => {
        state.value++;
      },
      decrement: (state) => {
        state.value--;
      },
      multiplyBy: {
        success: (state, action: PayloadAction<{ value: number }>) => {
          state.value = action.value;
        },
        trigger: noopReducer<{ multiplier: number }>(),
      },
    }
  });

const myInitialState: MyCounterState = {
  decremented: 0,
  incremented: 0,
  value: 0,
};

const { MyCounterActions, MyCounterFeature, MyCounterSelectors } =
  createNamespacedSlice({
    name: 'my-counter',
    initialState: myInitialState,
    reducers: {
      increment: (state) => {
        state.value++;
      },
      decrement: (state) => {
        state.value--;
      },
      multiplyBy: {
        success: (state, action: PayloadAction<{ value: number }>) => {
          state.value = action.value;
        },
        trigger: noopReducer<{ multiplier: number }>(),
      },
    },
  });

describe(createNamespacedSlice.name, () => {
  it('should return correct name', () => {
    expect(CounterFeature.name).toEqual('counter');
  });

  it('should return reducer', () => {
    expect(CounterFeature.reducer).toBeTruthy();
  });

  it('should return actions', () => {
    expect(CounterActions).toBeTruthy();
  });

  describe('selectors', () => {
    it('should return selectors', () => {
      expect(CounterSelectors).toBeTruthy();
      expect(Object.keys(CounterSelectors).length).toEqual(4);
    });

    it('should selectors return correct values', () => {
      expect(
        CounterSelectors.selectCounterState({ counter: initialState })
      ).toEqual(initialState);

      ['value', 'incremented', 'decremented'].forEach((key) => {
        expect(
          (CounterSelectors as any)[`select${classify(key)}`]({
            counter: initialState,
          })
        ).toEqual((initialState as any)[key]);
      });
    });
  });

  it('should noop reducers not change state', () => {
    const noop = noopReducer();
    const typedNoop = noopReducer<{ foo: 'foo' }>();

    noop(initialState);
    expect(initialState).toEqual({ value: 0, incremented: 0, decremented: 0 });

    typedNoop(initialState, {
      type: 'a',
      foo: 'foo',
      _payload: { foo: 'foo' },
    });
    expect(initialState).toEqual({ value: 0, incremented: 0, decremented: 0 });
  });

  it('should return correct complex feature name', () => {
    expect(MyCounterFeature.name).toEqual('my-counter');
    expect(MyCounterFeature.reducer).toBeTruthy();
    expect(MyCounterActions).toBeTruthy();
    expect(MyCounterSelectors.selectMyCounterState).toBeTruthy();
    expect(MyCounterSelectors.selectDecremented).toBeTruthy();
    expect(MyCounterSelectors.selectIncremented).toBeTruthy();
    expect(MyCounterSelectors.selectValue).toBeTruthy();
  });
});
