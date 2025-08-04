'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Card, CardBody, Button, Spinner, Chip } from '@heroui/react';
import { Icon } from '@iconify/react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

interface DashboardStats {
  totalItineraries: number;
  activeItineraries: number;
  totalCities: number;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalItineraries: 0,
    activeItineraries: 0,
    totalCities: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      const supabase = createClient();

      try {
        // Obtener estadísticas de itinerarios
        const { data: itineraries, error: itineraryError } = await supabase
          .from('itinerary')
          .select('*');

        if (itineraryError) throw itineraryError;

        // Obtener estadísticas de ciudades
        const { data: cities, error: cityError } = await supabase
          .from('city')
          .select('id_city');

        if (cityError) throw cityError;

        const totalItineraries = itineraries?.length || 0;
        const activeItineraries = itineraries?.filter(it => it.active).length || 0;
        const totalCities = cities?.length || 0;

        setStats({
          totalItineraries,
          activeItineraries,
          totalCities
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center space-y-4">
          <Spinner size="lg" color="primary" />
          <p className="text-gray-600 dark:text-gray-300">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header de Bienvenida */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          ¡Bienvenido a Golden Maya! 🌟
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Dashboard principal - Gestiona tus itinerarios y explora destinos increíbles
        </p>
      </div>

      {/* Tarjetas de Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Itinerarios</p>
                <p className="text-3xl font-bold">{stats.totalItineraries}</p>
              </div>
              <Icon icon="solar:route-outline" className="text-4xl text-blue-200" />
            </div>
          </CardBody>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Itinerarios Activos</p>
                <p className="text-3xl font-bold">{stats.activeItineraries}</p>
              </div>
              <Icon icon="solar:check-circle-outline" className="text-4xl text-green-200" />
            </div>
          </CardBody>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Ciudades</p>
                <p className="text-3xl font-bold">{stats.totalCities}</p>
              </div>
              <Icon icon="solar:city-outline" className="text-4xl text-purple-200" />
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Accesos Rápidos */}
      <Card>
        <CardBody className="p-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Accesos Rápidos
          </h3>
          <div className="space-y-4">
            <div className="mx-2">
              <Link href="/itinerary">
                <Button 
                  className="w-full justify-start h-14" 
                  variant="flat"
                  startContent={<Icon icon="solar:route-outline" className="text-xl" />}
                >
                  <div className="text-left">
                    <p className="font-medium">Gestionar Itinerarios</p>
                    <p className="text-xs text-gray-500">Crear, editar y administrar itinerarios</p>
                  </div>
                </Button>
              </Link>
            </div>

            <div className="mx-2">
              <Link href="/cities">
                <Button 
                  className="w-full justify-start h-14" 
                  variant="flat"
                  startContent={<Icon icon="solar:city-outline" className="text-xl" />}
                >
                  <div className="text-left">
                    <p className="font-medium">Catálogo de Ciudades</p>
                    <p className="text-xs text-gray-500">Explorar y gestionar destinos</p>
                  </div>
                </Button>
              </Link>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}