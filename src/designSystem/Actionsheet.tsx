import React, { ReactNode, forwardRef } from 'react';
import RBSheet, { RBSheetProps } from 'react-native-raw-bottom-sheet';

type ActionsheetProps = RBSheetProps & {
  children: ReactNode;
  ref: any | undefined;
};

const Actionsheet = forwardRef<any, ActionsheetProps>(({ children, ...props }, ref) => {
  return (
    <RBSheet {...props} ref={ref}>
      {children}
    </RBSheet>
  );
});

export default Actionsheet;
