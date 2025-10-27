import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const Employees = () => {
  // State variables
  const [employees, setEmployees] = useState([]); // stores all employees
  const [loading, setLoading] = useState(true);   // controls loading message

  // 🧩 Step 1: Fetch all employees when the page first loads
  useEffect(() => {
    const fetchEmployees = async () => {
      const { data, error } = await supabase.from('employees').select('*');

      if (error) {
        console.error('❌ Error fetching employees:', error);
      } else {
        console.log('✅ Initial employees fetched:', data);
        setEmployees(data);
      }

      setLoading(false);
    };

    fetchEmployees();
  }, []);

  // 🔁 Step 2: Subscribe to realtime changes from Supabase
  useEffect(() => {
    // Open a realtime channel for the "employees" table
    const channel = supabase
      .channel('employees-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'employees' },
        (payload) => {
          // Print the raw realtime payload to the browser console
          console.log('📡 Realtime payload received:', payload);

          // Normalize event type (for compatibility across SDK versions)
          const eventType = payload.eventType || payload.event;

          // Handle each event type
          if (eventType === 'INSERT') {
            // Add new employee to the top of the list
            setEmployees((prev) => [payload.new, ...prev]);
          } else if (eventType === 'UPDATE') {
            // Replace updated employee
            setEmployees((prev) =>
              prev.map((e) => (e.id === payload.new.id ? payload.new : e))
            );
          } else if (eventType === 'DELETE') {
            // Remove deleted employee
            setEmployees((prev) => prev.filter((e) => e.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    // 🧹 Step 3: Cleanup — unsubscribe when component unmounts
    return () => {
      try {
        channel.unsubscribe();
      } catch (e) {
        console.warn('⚠️ Error unsubscribing:', e);
      }

      if (supabase.removeChannel) {
        supabase.removeChannel(channel).catch(() => {});
      }
    };
  }, []);

  // 💬 Step 4: Show loading or employee list
  if (loading) return <p>Loading employees...</p>;

  return (
    <div style={{ padding: '20px' }}>
      <h2>👥 Employees</h2>
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
