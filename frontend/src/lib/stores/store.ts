import {createContext} from 'react';
import {UiStore} from './UiStore';


interface Store {
    uiStore: UiStore
}

export const store: Store = {

    uiStore: new UiStore(),
}


export const StoreContext = createContext(store);
