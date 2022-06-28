import { DataSet } from './dataset.data';
import { Team } from './team.data';
import { User } from './user.data';

export interface UserWithTeamsAndDatasets {
  datasets: DataSet[];
  teams: Team[];
  user: User;
}
