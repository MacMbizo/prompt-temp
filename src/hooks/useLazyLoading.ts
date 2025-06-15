
import { useState, useEffect, useCallback, useRef } from 'react';

interface UseLazyLoadingProps {
  hasNextPage: boolean;
  isLoading: boolean;
  loadMore: () => void;
  threshold?: number;
}

export const useLazyLoading = ({
  hasNextPage,
  isLoading,
  loadMore,
  threshold = 100
}: UseLazyLoadingProps) => {
  const [isFetching, setIsFetching] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const targetRef = useRef<HTMLDivElement | null>(null);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [target] = entries;
      if (target.isIntersecting && hasNextPage && !isLoading && !isFetching) {
        setIsFetching(true);
        loadMore();
      }
    },
    [hasNextPage, isLoading, isFetching, loadMore]
  );

  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(handleObserver, {
      rootMargin: `${threshold}px`,
      threshold: 0.1
    });

    const currentTarget = targetRef.current;
    if (currentTarget) {
      observerRef.current.observe(currentTarget);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [handleObserver, threshold]);

  useEffect(() => {
    if (!isLoading) {
      setIsFetching(false);
    }
  }, [isLoading]);

  const setTargetRef = useCallback((node: HTMLDivElement | null) => {
    targetRef.current = node;
    if (observerRef.current && node) {
      observerRef.current.observe(node);
    }
  }, []);

  return {
    setTargetRef,
    isFetching
  };
};
