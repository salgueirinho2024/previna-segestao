import ActivityWorkspace from '@/components/ActivityWorkspace';
import {listTasks,listUsers,listCompanies} from '@/lib/data';
export default async function Page(){const [tasks,users,companies]=await Promise.all([listTasks(),listUsers(),listCompanies()]);return <ActivityWorkspace tasks={tasks} users={users} companies={companies}/>;}
