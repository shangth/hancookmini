import { get, post, put, del } from '../utils/request';



export const getGatherings = async () => {
  const res = await get('/gatherings/list');
  return res;
}

export const createGathering = async (data: any) => {
  const res = await post('/gatherings/create', data);
  return res.data;
}

export const updateGathering = async (id: string, data: any) => {
  const res = await put(`/gatherings/update`, data);
  return res.data;
}

export const deleteGathering = async (id: string) => {
  const res = await del(`/gatherings/delete`, { id });
  return res.data;
}