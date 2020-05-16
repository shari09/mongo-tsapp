import React, {useContext} from 'react';
import {View, StyleSheet} from 'react-native';
import Modal from 'react-native-modal';
import {Spinner} from 'native-base';


import {UserContext} from '../utils/contexts';

interface Props {
  loggingOut: boolean;
};

const Logout: React.FC<Props> = ({loggingOut}) => {
  const {isLoggedIn} = useContext(UserContext);

  return (
    <View>
      <Modal 
        isVisible={isLoggedIn && loggingOut} 
        animationIn='zoomInDown' 
        animationOut='zoomOutUp'
      >
        <View style={styles.content}>
          <Spinner style={styles.spinner}/>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  content: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 5
  },
  spinner: {
    flex: 1,
    marginRight: 'auto',
    marginLeft: 'auto'
  }
});

export default Logout;