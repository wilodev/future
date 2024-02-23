import React, { useState } from 'react';
import StoryModal from './storyModal';
import Main from '~/components/StorySlides/Main';
import { useNavigation } from '@react-navigation/native';

export default function CourseCompleteScreen() {
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const navigation = useNavigation<any>();

  function onPressButtonNext(): void {
    setModalVisible(true);
  }

  return (
    <>
      <Main footerAction={onPressButtonNext} hasHeader={false} />
      <StoryModal
        state={modalVisible}
        onPressHide={() => setModalVisible(false)}
        onClose={() => {
          setModalVisible(false);
          navigation.goBack();
        }}
      />
    </>
  );
}
