import {
  createAsyncThunk,
  createEntityAdapter,
  createSlice,
  PayloadAction,
} from "@reduxjs/toolkit";
import type { EntityState } from "@reduxjs/toolkit";
import { useFetchCharacters } from "hooks/useFetchCharacters";
import { LoadingStatus } from "types/loadingStatus";
import { ShortCharacterInfo } from "types/shortCharacterInfo";

interface CharactersState {
  characters: EntityState<ShortCharacterInfo>;
  status: LoadingStatus;
  errors?: string | string[];
  favoriteCharacterIds: string[];
  lastPage: number;
}

const sliceName = "characters";

export const charactersAdapter = createEntityAdapter<ShortCharacterInfo>();

const initialState: CharactersState = {
  characters: charactersAdapter.getInitialState(),
  status: LoadingStatus.IDLE,
  errors: undefined,
  favoriteCharacterIds: [],
  lastPage: 0, //дефолтное значение, пока не придут данные с бэкенда
};

export const fetchCharacters = createAsyncThunk(
  `${sliceName}/fetchedCharacters`,
  useFetchCharacters
);

export const slice = createSlice({
  name: sliceName,
  initialState,
  reducers: {
    addToFavorite(state, { payload }: PayloadAction<string>) {
      state.favoriteCharacterIds.push(payload);
    },
    removeFromFavorite(state, { payload }: PayloadAction<string>) {
      const indexRemovedId = state.favoriteCharacterIds.findIndex(
        (id) => id === payload
      );
      if (indexRemovedId > -1) {
        state.favoriteCharacterIds.splice(indexRemovedId, 1);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCharacters.pending, (state) => {
        state.status = LoadingStatus.PENDING;
      })
      .addCase(fetchCharacters.fulfilled, (state, { payload }) => {
        state.status = LoadingStatus.IDLE;
        charactersAdapter.setAll(state.characters, payload.results);
        state.lastPage = payload.pages;
      })
      .addCase(fetchCharacters.rejected, (state, { error }) => {
        state.status = LoadingStatus.REJECTED;
        state.errors = error.message;
      });
  },
});

export const {
  reducer: charactersReducer,
  actions: { addToFavorite, removeFromFavorite },
} = slice;
