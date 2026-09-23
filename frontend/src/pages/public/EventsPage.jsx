import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import EventCard from '../../components/public/EventCard';

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/events/approved').then(setEvents).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <div className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h1 className="section-title">Platform Events</h1>
          <p className="mt-4 text-lg text-gray-600">
            Events featured on ChurchNivo — listed here after super-admin approval
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
          </div>
        ) : events.length === 0 ? (
          <p className="text-center text-gray-500">No approved events at this time.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {events.map((event) => (
              <EventCard key={event.id} event={event} showChurch />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
