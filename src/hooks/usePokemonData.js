import { useState, useEffect, useRef, useCallback } from 'react';
import {
    getPokemonList,
    getPokemonDetailsByUrl,
    fetchPokemonDetails,
    getPokemonListByType
} from '../api/pokedexApi';

const POKEMONS_PER_PAGE = 10;

export const usePokemonData = () => {
    const [pokemons, setPokemons] = useState([]);
    const [nextOffset, setNextOffset] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [selectedType, setSelectedType] = useState(null);
    const [allFilteredUrls, setAllFilteredUrls] = useState([]);
    const controllerRef = useRef(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [searchedPokemon, setSearchedPokemon] = useState(null);
    const [searchError, setSearchError] = useState(null);

    const fetchPokemons = useCallback(async (offset, type, controller = null) => {
        setIsLoading(true);
        let listDataResults = [];
        let totalPokemons = 0;

        const signal = controller ? controller.signal : null;
        let currentFilteredUrls = allFilteredUrls;

        try {
            if (type) {
                if (offset === 0) {
                    const allPokemonsOfType = await getPokemonListByType(type, { signal });
                    currentFilteredUrls = allPokemonsOfType;
                    setAllFilteredUrls(allPokemonsOfType);
                    totalPokemons = allPokemonsOfType.length;

                } else {
                    totalPokemons = allFilteredUrls.length;
                }

                const start = offset;
                const end = offset + POKEMONS_PER_PAGE;
                currentFilteredUrls = currentFilteredUrls || [];
                listDataResults = currentFilteredUrls.slice(start, end);

                const nextOffsetValue = end;
                setNextOffset(nextOffsetValue);
                setHasMore(nextOffsetValue < totalPokemons);

            } else {
                const listData = await getPokemonList(offset, POKEMONS_PER_PAGE, { signal });
                listDataResults = listData.results;

                setAllFilteredUrls([]);

                const nextOffsetValue = offset + POKEMONS_PER_PAGE;
                setNextOffset(nextOffsetValue);
                setHasMore(!!listData.next);
            }

            const detailedPokemonsPromises = listDataResults.map(item =>
                getPokemonDetailsByUrl(item.url, { signal })
            );
            const detailedPokemons = await Promise.all(detailedPokemonsPromises);

            const isObsolete = controller && controllerRef.current && controller !== controllerRef.current;

            if (isObsolete) {
                return;
            }

            setPokemons(prevPokemons => {
                const uniqueNewPokemons = detailedPokemons.filter(newP => newP && newP.id);

                if (offset === 0) {
                    return uniqueNewPokemons;
                }

                const existingIds = new Set(prevPokemons.map(p => p.id));
                const reallyUniqueNewPokemons = uniqueNewPokemons.filter(newP =>
                    !existingIds.has(newP.id)
                );
                return [...prevPokemons, ...reallyUniqueNewPokemons];
            });

        } catch (error) {
            if (error.name === 'AbortError') {
                return;
            }

            if (error.response && error.response.status === 404) {
                setSearchError(`Pokémon "${searchTerm}" não encontrado.`);
            } else {
                console.error("Failed to fetch pokemons:", error);
            }
        } finally {
            if (controller === controllerRef.current || controller === null) {
                setIsLoading(false);
            }
        }
    }, [allFilteredUrls, searchTerm]);

    useEffect(() => {
        const controller = new AbortController();
        controllerRef.current = controller;
        fetchPokemons(0, null, controller);
        return () => controller.abort();
    }, []);
    useEffect(() => {
        if (!searchTerm) {
            setSearchedPokemon(null);
            setSearchError(null);
            return;
        }
        if (controllerRef.current) {
            controllerRef.current.abort();
        }

        const searchController = new AbortController();
        
        const fetchSearch = async () => {
            setIsLoading(true);
            try {
                setSearchError(null);
                setSearchedPokemon(null);
                const details = await fetchPokemonDetails(searchTerm, { 
                    signal: searchController.signal 
                });

                setSearchedPokemon(details);
            } catch (error) {
                if (error.name === 'AbortError') {
                    return;
                }
                
                setSearchedPokemon(null);
                if (error.response && error.response.status === 404) {
                    setSearchError(`Pokémon "${searchTerm}" não encontrado.`);
                } else {
                    console.error("Failed to fetch searched pokemon:", error);
                    setSearchError("Erro desconhecido ao buscar Pokémon.");
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchSearch();
        return () => searchController.abort();
    }, [searchTerm]);


    const handleLoadMore = () => {
        fetchPokemons(nextOffset, selectedType, controllerRef.current);
    };

    const handleTypeFilter = (event) => {
        if (controllerRef.current) {
            controllerRef.current.abort();
        }
        const controller = new AbortController();
        controllerRef.current = controller;

        const type = event.target.value;
        const newType = type === 'all' ? null : type;

        setSearchTerm('');
        setSearchedPokemon(null);
        setSearchError(null);
        setSelectedType(newType);
        setPokemons([]);
        setNextOffset(0);
        setHasMore(true);
        setAllFilteredUrls([]);

        fetchPokemons(0, newType, controller);
    };

    return {
        pokemons,
        isLoading,
        hasMore,
        searchTerm,
        searchedPokemon,
        searchError,
        selectedType,
        setSearchTerm,
        setSearchedPokemon,
        setSearchError,
        setIsLoading,
        fetchPokemonDetails,
        handleLoadMore,
        handleTypeFilter,
    };
};