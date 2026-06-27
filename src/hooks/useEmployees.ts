import { useState, useEffect, useCallback } from 'react';
import type { Employee } from '../types/employee';
import { storage } from '../data/storage';

export function useEmployees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const data = await storage.getEmployees();
      setEmployees(data);
    } catch (err) {
      console.error('Erro ao carregar funcionários:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addEmployee = useCallback(async (employee: Employee) => {
    await storage.addEmployee(employee);
    await refresh();
  }, [refresh]);

  const updateEmployee = useCallback(async (employee: Employee) => {
    await storage.updateEmployee(employee);
    await refresh();
  }, [refresh]);

  const deleteEmployee = useCallback(async (id: string) => {
    await storage.deleteEmployee(id);
    await refresh();
  }, [refresh]);

  const getEmployee = useCallback((id: string) => {
    return employees.find(e => e.id === id);
  }, [employees]);

  return { employees, loading, addEmployee, updateEmployee, deleteEmployee, getEmployee };
}
