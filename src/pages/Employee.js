import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

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
