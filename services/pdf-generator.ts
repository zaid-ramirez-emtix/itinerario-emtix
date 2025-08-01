import { createClient } from '@/utils/supabase/client'

// Estructuras obtenidas del motor de PDF

interface PDFDay {
  dayNumber: number
  city: string
  image: string
  summaryText: string
  lodgingName: string
  activities: Array<{
    order: number
    type: string
    description: string
    travelTime?: string
    link?: string
  }>
}

interface PDFRequest {
  title: string
  destination: string
  startDate: string
  endDate: string
  summaryHeading: string
  detailedHeading: string
  summaryReference: string
  itineraryImage: string
  logoSystem: {
    src: string
    alt: string
    scale: number
    align: string
    goldenMayaFix: boolean
    objectPosition: string
    debug: boolean
  }
  logoClient?: {
    src: string
    alt: string
    scale: number
    align: string
    goldenMayaFix: boolean
    objectPosition: string
    debug: boolean
  }
  logoAgency: {
    src: string
    alt: string
    scale: number
    align: string
    goldenMayaFix: boolean
    objectPosition: string
    debug: boolean
  }
  designImageFrontcover: string
  designImageBackcover: string
  days: PDFDay[]
  theme: {
    language: string
    pageHeightPx: number
    pageWidthPx: number
    pagePaddingPx: number
    fontBodySize: number
    lineHeight: number
    headingImageHeight: number
    cityImgSizePx: number
    fontTitle: string
    fontSubtitle: string
    fontBody: string
    fontSizeTitle: number
    fontSizeSubtitle: number
    headingFontSize: number
    marginTitleTop: number
    marginSubtitleTop: number
    colorCover: string
    colorBackcover: string
    colorHeadings: string
    timelineColor: string
    pageBackgroundColor: string
    summaryBannerBorderColor: string
    summaryBannerTextColor: string
    summaryBannerBackgroundColor: string
    titleCase: string
    titleAlignment: string
    iconStyle: string
    dayLayout: string
    iconSize: number
    sectionSpacing: number
    paragraphSpacing: number
    sectionDivider: string
  }
}

const URL_PDF_EGINE = 'http://localhost:3001'

export async function generateItineraryPDF(itineraryId: string): Promise<void> {
  const supabase = createClient()
  
  try {
    // Verificar conexión al servicio PDF
    try {
      const healthCheck = await fetch(URL_PDF_EGINE, { 
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      })
    } catch (healthError) {
      throw new Error(`No se puede conectar al servicio de PDF en ${URL_PDF_EGINE}. Asegúrate de que el servicio esté ejecutándose.`)
    }

    // Obtener el itinerario con el tema
    const { data: itinerary, error: itineraryError } = await supabase
      .from('itinerary')
      .select(`
        *,
        theme:id_theme (*)
      `)
      .eq('id_itinerary', itineraryId)
      .single()

    if (itineraryError || !itinerary) {
      throw new Error('Error al obtener el itinerario')
    }

    // Obtener los días con ciudades y actividades
    const { data: daysData, error: daysError } = await supabase
      .from('day')
      .select(`
        *,
        city:id_city (*),
        activity (*)
      `)
      .eq('id_itinerary', itineraryId)
      .eq('active', true)
      .order('order', { ascending: true })

    if (daysError) {
      throw new Error('Error al obtener los días del itinerario')
    }

    // Función para generar URLs absolutas
    const getAbsoluteImageUrl = (path: string | null | undefined, fallback: string = 'https://placehold.co/600x300?text=Imagen'): string => {
      if (!path) return fallback
      if (path.startsWith('http')) return path
      const baseUrl = typeof window !== 'undefined' 
        ? window.location.origin 
        : process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000' // TODO: Cambiar cuando se implemente el almacenamiento de supabase
      return `${baseUrl}${path.startsWith('/') ? path : '/' + path}`
    }

    // Mapear tipos de actividad a los tipos que espera el motor PDF
    const mapActivityType = (type: string): string => {
      const validTypes = ['AM', 'PM', 'BUS', 'FLIGHT', 'DINNER', 'SHOP']
      
      // Los tipos ya vienen en el formato correcto desde la UI
      if (validTypes.includes(type.toUpperCase())) {
        return type.toUpperCase()
      }
      
      // Fallback para tipos no reconocidos
      return 'PM'
    }

    // Procesar días y actividades
    const pdfDays: PDFDay[] = daysData?.map((day, index) => {
      const activities = day.activity
        ?.filter((activity: any) => activity.active)
        ?.sort((a: any, b: any) => a.order - b.order)
        ?.map((activity: any, actIndex: number) => ({
          order: actIndex + 1,
          type: mapActivityType(activity.activity_type),
          description: activity.activity_description,
          travelTime: activity.transfer_time || undefined,
          link: activity.activity_link || undefined
        })) || []

      return {
        dayNumber: index + 1,
        city: day.city?.city_name || day.id_city,
        image: getAbsoluteImageUrl(day.image_path || day.city?.city_image_path, 'https://placehold.co/600x300?text=Imagen+del+día'),
        summaryText: day.day_description,
        lodgingName: day.lodging_place || '',
        activities
      }
    }) || []

    // Mapear idiomas a códigos válidos para el motor PDF
    const mapLanguageToLocale = (language: string): string => {
      const languageMap: { [key: string]: string } = {
        'es': 'es',
        'en': 'en',
        'es-ES': 'es',
        'en-US': 'en',
        'español': 'es',
        'english': 'en',
        'spanish': 'es'
      }
      return languageMap[language.toLowerCase()] || 'es'
    }

    // Construir el objeto PDF request
    const pdfRequest: PDFRequest = {
      title: itinerary.title || 'Itinerario Sin Título',
      destination: itinerary.destination || 'Destino Desconocido',
      startDate: itinerary.start_date,
      endDate: itinerary.end_date,
      summaryHeading: "Resumen Ejecutivo del Itinerario",
      detailedHeading: "Programa Detallado Día a Día",
      summaryReference: `${itinerary.destination || 'Destino'} - ${new Date(itinerary.start_date).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}`,
      itineraryImage: getAbsoluteImageUrl(itinerary.path_itinerary_image),
      logoSystem: {
        // src: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/logo_golden.svg`,
        src: 'https://goldenmaya.app/static/assets/img/logo.svg',
        alt: "Sistema Logo",
        scale: 1.2,
        align: "left",
        goldenMayaFix: true,
        objectPosition: "center",
        debug: false
      },
      logoClient: itinerary.path_img_client ? {
        src: getAbsoluteImageUrl(itinerary.path_img_client),
        alt: "Logo Cliente",
        scale: 0.8,
        align: "center",
        goldenMayaFix: false,
        objectPosition: "top",
        debug: false
      } : undefined,
      logoAgency: {
        src: getAbsoluteImageUrl(itinerary.theme?.path_img_agency || itinerary.path_img_fair),
        alt: "Logo Agencia",
        scale: 0.75,
        align: "right",
        goldenMayaFix: false,
        objectPosition: "bottom",
        debug: false
      },
      designImageFrontcover: getAbsoluteImageUrl(itinerary.path_img_front),
      designImageBackcover: getAbsoluteImageUrl(itinerary.path_img_back),
      days: pdfDays,
      theme: {
        language: mapLanguageToLocale(itinerary.language),
        pageHeightPx: Number(itinerary.theme?.page_height_px) || 1536,
        pageWidthPx: Number(itinerary.theme?.page_width_px) || 960,
        pagePaddingPx: Number(itinerary.theme?.page_padding_px) || 20,
        fontBodySize: Number(itinerary.theme?.font_body_size) || 14,
        lineHeight: Number(itinerary.theme?.line_height) || 1.6,
        headingImageHeight: Number(itinerary.theme?.heading_image_height) || 320,
        cityImgSizePx: Number(itinerary.theme?.city_img_size_px) || 95,
        fontTitle: itinerary.theme?.font_title || "Montserrat",
        fontSubtitle: itinerary.theme?.font_title || "Montserrat",
        fontBody: itinerary.theme?.font_body || "Montserrat",
        fontSizeTitle: Number(itinerary.theme?.font_size_title) || 58,
        fontSizeSubtitle: 22,
        headingFontSize: Number(itinerary.theme?.heading_font_size) || 42,
        marginTitleTop: Number(itinerary.theme?.margin_title_top) || 240,
        marginSubtitleTop: 20,
        colorCover: itinerary.theme?.color_cover || "#ffffff",
        colorBackcover: itinerary.theme?.color_back_cover || "#f8f9fa",
        colorHeadings: itinerary.theme?.color_headings || "#ffffff",
        timelineColor: itinerary.theme?.timeline_color || "#2c3e50",
        pageBackgroundColor: itinerary.theme?.page_background_color || "#fdf9f0",
        summaryBannerBorderColor: itinerary.theme?.summary_banner_border_color || "#34495e",
        summaryBannerTextColor: itinerary.theme?.summary_banner_text_color || "#2c3e50",
        summaryBannerBackgroundColor: itinerary.theme?.summary_banner_background_color || "#ecf0f1",
        titleCase: itinerary.theme?.title_case || "capitalize",
        titleAlignment: itinerary.theme?.title_alignment || "center",
        iconStyle: itinerary.theme?.icon_style || "line",
        dayLayout: itinerary.theme?.day_layout || "horizontal",
        iconSize: Number(itinerary.theme?.icon_size) || 24,
        sectionSpacing: Number(itinerary.theme?.section_spacing) || 16,
        paragraphSpacing: Number(itinerary.theme?.paragraph_spacing) || 12,
        sectionDivider: itinerary.theme?.section_divider || "solid"
      }
    }

    // Validar datos mínimos requeridos
    if (!itinerary.title || !itinerary.destination || !itinerary.start_date || !itinerary.end_date) {
      throw new Error('Faltan datos básicos del itinerario (título, destino o fechas)')
    }

    // Validar que las fechas sean válidas
    const startDate = new Date(itinerary.start_date)
    const endDate = new Date(itinerary.end_date)
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new Error('Las fechas del itinerario no son válidas')
    }

    // Log para debugging
    console.log('=== DATOS DEL ITINERARIO ===')
    console.log('Language original:', itinerary.language)
    console.log('Language mapeado:', mapLanguageToLocale(itinerary.language))
    console.log('Título:', itinerary.title)
    console.log('Destino:', itinerary.destination)
    console.log('Fechas:', itinerary.start_date, '->', itinerary.end_date)
    console.log('Días procesados:', pdfDays.length)
    console.log('=== OBJETO PDF COMPLETO ===')
    console.log('PDF Request Data:', JSON.stringify(pdfRequest, null, 2))

    // Realizar la petición al servicio de PDF
    const response = await fetch(`${URL_PDF_EGINE}/itinerary_classic`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(pdfRequest)
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Error desconocido del servidor')
      console.error('Error response from PDF service:', errorText)
      
      // Verificar si es un error de locale específico
      if (errorText.includes('Incorrect locale information provided')) {
        throw new Error(`Error de configuración de idioma en el PDF. El idioma "${itinerary.language}" no es válido. Idiomas soportados: 'es', 'en'`)
      }
      
      throw new Error(`Error del servidor PDF: ${response.status} ${response.statusText}. ${errorText}`)
    }

    // Descargar el PDF
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${itinerary.title.replace(/[^a-zA-Z0-9]/g, '_')}_itinerario.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)

  } catch (error) {
    console.error('Error generando PDF:', error)
    throw error
  }
}
