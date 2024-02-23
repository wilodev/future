export type CourseType = {
  id: string;
  title: string;
  image: string;
  completed: boolean;
};

export interface DataItemInterface {
  id: number;
  view: boolean;
  hours?: number;
  courses?: CourseType[];
  rate?: number;
}
