import {Text, View} from 'native-base';
import React, {useContext} from 'react';
import {StyleProp, StyleSheet, TouchableOpacity, ViewStyle} from 'react-native';
import {Theme, ThemeColour, ThemeContext} from '../utils/contexts';

interface Props {
  buttonOnPress: () => void;
  buttonText: string;
  buttonProps?: {};
  style?: StyleProp<ViewStyle>;
}

const Button: React.FC<Props> = ({
  buttonOnPress,
  buttonText,
  buttonProps,
  style,
}) => {
  const {colour} = useContext<Theme>(ThemeContext);
  const styles = getStyles(colour);

  return (
    <View>
      <TouchableOpacity
        onPress={buttonOnPress}
        {...buttonProps}
        style={[styles.container, style]}
        activeOpacity={0.8}>
        <View>
          <Text style={styles.buttonText}>{buttonText.toUpperCase()}</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const getStyles = (colour: ThemeColour) => {
  const styles = StyleSheet.create({
    container: {
      marginTop: 30,
      backgroundColor: colour.button.background,
      borderRadius: 30,
      padding: 13,
      justifyContent: 'center',
      elevation: 7,
    },
    buttonText: {
      textAlign: 'center',
      fontSize: 20,
      width: '100%',
      fontFamily: 'sans-serif-medium',
      color: colour.button.text,
    },
  });
  return styles;
};

export default Button;
