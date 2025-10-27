import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'employees' },
        (payload) => {
          // Normalize event type across supabase versions
          const eventType = payload.eventType || payload.event;

          if (eventType === 'INSERT') {
            setEmployees((prev) => [payload.new, ...prev]);
          } else if (eventType === 'UPDATE') {
            setEmployees((prev) =>
              prev.map((e) => (e.id === payload.new.id ? payload.new : e))
            );
          } else if (eventType === 'DELETE') {
            setEmployees((prev) => prev.filter((e) => e.id !== payload.old.id));
          } else {
            console.log('Realtime payload:', payload);
          }
        }
      )
      .subscribe();

    return () => {
      // best-effort cleanup
      try {
        channel.unsubscribe();
      } catch (e) {
        /* ignore */
      }
      // removeChannel may be supported depending on supabase client version
      if (supabase.removeChannel) supabase.removeChannel(channel).catch(() => {});
    };
  }, []);
  useEffect(() => {
    const fetchEmployees = async () => {
      const { data, error } = await supabase
        .from('employees')
        .select('*');

      if (error) {
        console.error('Error fetching employees:', error);
      } else {
        setEmployees(data);
      }

      setLoading(false);
    };

    fetchEmployees();
  }, []);

  if (loading) return <p>Loading employees...</p>;

  return (
    <div style={{ padding: '20px' }}>
      <h2>Employees</h2>
      {employees.length === 0 ? (
        <p>No employees found.</p>
      ) : (
        <ul>
          {employees.map((emp) => (
            <li key={emp.id}>
              <strong>{emp.name}</strong> — {emp.position} (${emp.salary})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Employees;
