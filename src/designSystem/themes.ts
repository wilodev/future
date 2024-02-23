import { Theme as RNTheme, useTheme as useRNTheme } from '@react-navigation/native';

export const useTheme = useRNTheme as () => Theme;

export type Theme = RNTheme & {
  colors: Record<
    | 'textColorStories'
    | 'backgroundStories'
    | 'backgroundAlt'
    | 'bar'
    | 'borderAlt'
    | 'currentStepBackground'
    | 'checkbox'
    | 'focus'
    | 'icon'
    | 'inactive'
    | 'input'
    | 'lightGrey'
    | 'placeholder'
    | 'progressBarTrack'
    | 'primaryButtonBackground'
    | 'primaryButtonText'
    | 'secondaryButtonBackground'
    | 'secondaryButtonText'
    | 'staticGrey700'
    | 'staticPink500'
    | 'toast'
    | 'tertiaryButtonBackground'
    | 'tertiaryButtonText'
    | 'textGrey'
    | 'textGreyAlt'
    | 'warning'
    | 'warningBackground'
    | 'white'
    | 'posterIconBackground'
    | 'staticPink300'
    | 'staticBlue500'
    | 'staticBlack'
    | 'staticPurple500',
    string
  >;
};

export type ColorName = keyof Theme['colors'];

enum Color {
  black = '#000000',
  white = '#FFFFFF',

  navy_500 = '#0D062F',

  blue_500 = '#2541FC',

  purple_500 = '#8700CD',

  midnight_300 = '#2D2F37',
  midnight_400 = '#3A343A',
  midnight_500 = '#2F3032',
  midnight_700 = '#16171C',

  grey_900 = '#121212',
  grey_800 = '#393B42',
  grey_700 = '#4A4D55',
  grey_500 = '#727376',
  grey_300 = '#CACACC',
  grey_200 = '#EDEDEE',

  pink_500 = '#DE00A5',
  pink_400 = '#FF99E5',
  pink_300 = '#F1C5E6',
  pink_200 = '#FFE8F9',

  red_500 = '#E81906',
  red_300 = '#FB766A',

  yellow_500 = '#FECB51',

  transparent = 'transparent',
}

export const darkTheme: Theme = {
  dark: true,
  colors: {
    backgroundStories: Color.navy_500,
    textColorStories: Color.grey_200,
    background: Color.black,
    backgroundAlt: Color.midnight_300,
    bar: Color.grey_300,
    border: Color.grey_500,
    borderAlt: Color.grey_500,
    card: Color.midnight_700,
    checkbox: Color.grey_800,
    currentStepBackground: Color.transparent,
    focus: Color.white,
    icon: Color.white,
    inactive: Color.grey_500,
    input: Color.black,
    lightGrey: Color.grey_200,
    notification: Color.white,
    placeholder: Color.grey_800,
    primary: Color.pink_400,
    primaryButtonBackground: Color.pink_400,
    primaryButtonText: Color.grey_900,
    progressBarTrack: Color.grey_200,
    secondaryButtonBackground: Color.black,
    secondaryButtonText: Color.pink_400,
    staticGrey700: Color.grey_700,
    staticPink500: Color.pink_500,
    tertiaryButtonBackground: Color.white,
    tertiaryButtonText: Color.grey_900,
    toast: Color.grey_700,
    text: Color.white,
    textGrey: Color.grey_300,
    textGreyAlt: Color.grey_300,
    warning: Color.red_300,
    white: Color.white,
    posterIconBackground: Color.black,
    warningBackground: Color.yellow_500,
    staticPink300: Color.pink_300,
    staticBlue500: Color.blue_500,
    staticPurple500: Color.purple_500,
    staticBlack: Color.black,
  },
};

export const lightTheme: Theme = {
  dark: false,
  colors: {
    backgroundStories: Color.white,
    textColorStories: Color.midnight_400,
    background: Color.white,
    backgroundAlt: Color.white,
    bar: Color.grey_500,
    border: Color.white,
    borderAlt: Color.grey_300,
    card: Color.grey_200,
    checkbox: Color.grey_200,
    currentStepBackground: Color.pink_200,
    focus: Color.grey_700,
    icon: Color.grey_900,
    inactive: Color.grey_300,
    input: Color.grey_200,
    lightGrey: Color.grey_200,
    notification: Color.grey_900,
    placeholder: Color.grey_200,
    progressBarTrack: Color.grey_300,
    primary: Color.pink_500,
    primaryButtonBackground: Color.pink_500,
    primaryButtonText: Color.white,
    secondaryButtonBackground: Color.white,
    secondaryButtonText: Color.pink_500,
    staticGrey700: Color.grey_700,
    staticPink500: Color.pink_500,
    toast: Color.grey_300,
    tertiaryButtonBackground: Color.grey_800,
    tertiaryButtonText: Color.white,
    text: Color.grey_900,
    textGrey: Color.grey_500,
    textGreyAlt: Color.grey_700,
    warning: Color.red_500,
    white: Color.white,
    posterIconBackground: Color.black,
    warningBackground: Color.yellow_500,
    staticPink300: Color.pink_300,
    staticBlue500: Color.blue_500,
    staticPurple500: Color.purple_500,
    staticBlack: Color.black,
  },
};
