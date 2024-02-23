import { DataItemInterface } from './type';

export const Data: DataItemInterface[] = [
  {
    id: 1,
    view: false,
    hours: 9367,
  },
  {
    id: 2,
    view: false,
    courses: [
      {
        id: '123',
        title: 'Physics, Astronomy, and Space Applications',
        image: 'https://via.placeholder.com/150/92c952',
        completed: true,
      },
      {
        id: '323',
        title: 'Frontier Physics, Future Technologies',
        image: 'https://via.placeholder.com/150/92c952',
        completed: true,
      },
      {
        id: '432',
        title: 'Introduction to Lasers',
        image: 'https://via.placeholder.com/150/92c952',
        completed: false,
      },
    ],
  },
  {
    id: 3,
    view: false,
    rate: 94,
  },
  // {
  //   id: 4,
  //   view: false,
  //   hours: 9367,
  //   rate: 94,
  //   courses: [
  //     {
  //       id: '123',
  //       title: 'Physics, Astronomy, and Space Applications',
  //       image: 'https://via.placeholder.com/150/92c952',
  //       completed: true,
  //     },
  //     {
  //       id: '323',
  //       title: 'Frontier Physics, Future Technologies',
  //       image: 'https://via.placeholder.com/150/92c952',
  //       completed: true,
  //     },
  //     {
  //       id: '432',
  //       title: 'Introduction to Lasers',
  //       image: 'https://via.placeholder.com/150/92c952',
  //       completed: false,
  //     },
  //   ],
  // },
];
