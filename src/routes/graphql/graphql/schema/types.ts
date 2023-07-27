export type userT = {
  id: string,
  name: string,
  balance: number
};

export type NewUserT = {
  name: string,
  balance: number
};

export type PostT = {
  id: string,
  title: string,
  content: string,
  authorId: string
};

export type NewPostT = {
  title: string,
  content: string,
  authorId: string
};

export type ProfileT = {
  isMale: boolean,
  yearOfBirth: number,
  user: userT,
  userId: string,
  memberType: MemberT,
  memberTypeId: MemberEnumT,
};

export type NewProfileT = {
  isMale: boolean,
  yearOfBirth: number,
  userId: string,
  memberTypeId: MemberEnumT,
};

export type SubscribersOnAuthorsT = {
  subscriberId: string,
  authorId: string
}

export type MemberT = {
  id: MemberEnumT,
  discount: number,
  postsLimitPerMonth: number,
  profiles: ProfileT,
}

export enum MemberEnumT {
  BASIC = 'basic',
  BUSINESS = 'business',
}