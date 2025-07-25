'use client'

import { useEffect, useRef } from 'react'

/**
 * Hook personalizado para prevenir scroll no deseado en componentes Select
 * Soluciona el problema común donde el Select hace scroll de la página al abrirse
 */
export function useSelectWithoutScroll() {
  const selectRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!selectRef.current) return

    const selectElement = selectRef.current
    let scrollPosition = 0

    // Función para capturar la posición actual del scroll
    const captureScrollPosition = () => {
      scrollPosition = window.pageYOffset || document.documentElement.scrollTop
    }

    // Función para restaurar la posición del scroll
    const restoreScrollPosition = () => {
      window.scrollTo(0, scrollPosition)
    }

    // Event listeners para manejar el comportamiento del Select
    const handleMouseDown = (e: MouseEvent) => {
      captureScrollPosition()
    }

    const handleFocus = (e: FocusEvent) => {
      captureScrollPosition()
      // Usar setTimeout para asegurar que el scroll se restaure después del comportamiento del Select
      setTimeout(restoreScrollPosition, 0)
    }

    const handleClick = (e: MouseEvent) => {
      captureScrollPosition()
      setTimeout(restoreScrollPosition, 10)
    }

    // Agregar listeners al elemento Select
    selectElement.addEventListener('mousedown', handleMouseDown)
    selectElement.addEventListener('focus', handleFocus, true)
    selectElement.addEventListener('click', handleClick)

    // Prevenir scroll en el documento cuando se interactúa con el Select
    const preventDocumentScroll = (e: Event) => {
      if (selectElement.contains(e.target as Node)) {
        e.stopPropagation()
      }
    }

    document.addEventListener('scroll', preventDocumentScroll, true)

    // Cleanup
    return () => {
      selectElement.removeEventListener('mousedown', handleMouseDown)
      selectElement.removeEventListener('focus', handleFocus, true)
      selectElement.removeEventListener('click', handleClick)
      document.removeEventListener('scroll', preventDocumentScroll, true)
    }
  }, [])

  // Configuración optimizada para el Select
  const selectProps = {
    scrollShadowProps: {
      isEnabled: false
    },
    listboxProps: {
      emptyContent: "No hay opciones disponibles"
    },
    popoverProps: {
      placement: "bottom-start" as const,
      offset: 10,
      shouldFlip: false,
      shouldCloseOnBlur: true,
      shouldBlockScroll: false,
      motionProps: {
        initial: { opacity: 0, scale: 0.98 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.98 },
        transition: { 
          type: "spring",
          damping: 25,
          stiffness: 300,
          duration: 0.15
        }
      }
    },
    classNames: {
      trigger: "min-h-unit-12 data-[open=true]:border-primary focus:!outline-none",
      listbox: "max-h-60 p-1",
      popoverContent: "p-1 min-w-[200px] focus:!outline-none"
    }
  }

  return { selectRef, selectProps }
}
