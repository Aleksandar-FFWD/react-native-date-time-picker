import React, { Component } from 'react';
import {
    View,
    Text,
    ViewPropTypes,
    DatePickerIOS,
    TimePickerAndroid,
    Image,
    Modal,
    TouchableOpacity,
    Animated,
    Platform,
} from 'react-native';

/* Packages */
import PropTypes from 'prop-types';
import moment from 'moment';

/* Functions */
import { momentRound } from './lib';

/* Styles */
import styles from './styles';

const AndroidActions = {
    timeSetAction: "timeSetAction",
    dismissedAction: 'dismissedAction'
};

class TimePicker extends Component {
    constructor(props) {
        super(props);

        this.state = {
            timestamp: null,

            isVisible: false, /* For IOS modal */
            animatedHeight: new Animated.Value(0),
        };
    };

    componentWillMount() {
        const { timestamp } = this.props;

        this.setState({
            timestamp: this.momentRoundTimestamp(timestamp),
        });
    };

    componentWillReceiveProps(nextProps) {
        if (nextProps.timestamp !== this.props.timestamp) {
            this.setState({
                timestamp: nextProps.timestamp,
            });
        };
    };

    hide(callback) {
        Animated.timing(
            this.state.animatedHeight, {
                toValue: 0,
                duration: 300
            }
        ).start(() => {
            this.setState({
                isVisible: false
            },
                () => {
                    if (callback && typeof callback === 'function') {
                        return callback();
                    }
                }
            );
        });
    };

    show() {
        this.setState({
            isVisible: true,
            timestampIOS: this.state.timestamp
        },
            () => {
                Animated.timing(
                    this.state.animatedHeight, {
                        toValue: 259,
                        duration: 300
                    }
                ).start();
            }
        );
    };

    getTimeLabel() {
        const { timestamp } = this.props;

        if (moment(timestamp).isValid()) {
            return moment(timestamp).format('HH:mm');
        };

        return '';
    };

    handlePickerPress() {
        const { onPress } = this.props;

        if (onPress && typeof onPress === "function") {
            onPress();
        };

        if (Platform.OS === 'ios') {
            this.show();
        } else {
            var momentObject = moment(this.state.timestamp);
            TimePickerAndroid
                .open({
                    hour: momentObject.get('hour'),
                    minute: momentObject.get('minute'),
                    is24Hour: true
                })
                .then((response) => {
                    return this.handleTimeChangeAndroid(response);
                });
        };
    };

    handleTimeChangeAndroid(response) {
        if (response.action != AndroidActions.dismissedAction) {
            var momentObject = moment(this.state.timestamp),
                timestamp;

            momentObject.set({ hour: response.hour, minute: response.minute }),
                timestamp = this.toTimestamp(momentObject);

            return this.handleTimeChange(timestamp);
        };
    };

    toTimestamp(momentObject) {
        return momentObject.unix() * 1000;
    };

    momentRoundTimestamp(timestamp) {
        const { minuteInterval } = this.props;

        if (typeof minuteInterval === 'number' && minuteInterval !== null) {

            var momentObjectRounded = momentRound(moment(timestamp), minuteInterval, 'minutes', 'ceil'),
                timestamp = this.toTimestamp(momentObjectRounded)

            return timestamp;
        };

        return timestamp;
    };

    handleTimeChangeIOS(date) {
        this.setState({
            timestampIOS: this.toTimestamp(moment(date))
        });
    };

    handleTimeChange(timestamp) {
        if (Platform.OS === 'ios') {
            this.hide(
                () => {
                    return this.submitTimeChange(timestamp);
                }
            );
        } else {
            return this.submitTimeChange(timestamp);
        };
    };

    submitTimeChange(timestamp) {
        var momentObjectRoundedTimestamp = this.momentRoundTimestamp(timestamp);

        this.props.onTimeChange(momentObjectRoundedTimestamp);
    };

    renderTimePickerIOS() {
        return (
            <Modal
                animationType={'none'}
                transparent={true}
                visible={this.state.isVisible}
                onRequestClose={
                    () => {
                        return this.hide();
                    }
                }
            >
                <View style={styles.modal_outer_container}>
                    <TouchableOpacity
                        style={styles.modal_outer_container}
                        activeOpacity={1}
                        onPress={
                            () => {
                                return this.hide();
                            }
                        }
                    />
                    <Animated.View
                        style={[
                            styles.modal_inner_container, {
                                height: this.state.animatedHeight
                            },
                        ]}
                    >
                        <View style={styles.modal_button_holder}>
                            <TouchableOpacity
                                style={[styles.modal_button, { left: 0 }]}
                                onPress={
                                    () => {
                                        return this.hide();
                                    }
                                }
                            >
                                <Text style={styles.modal_button_text}>
                                    {this.props.cancelButtonText.toUpperCase()}
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modal_button, { right: 0 }]}
                                onPress={
                                    () => {
                                        return this.handleTimeChange(this.state.timestampIOS);
                                    }
                                }
                            >
                                <Text style={styles.modal_button_text}>
                                    {this.props.confirmButtonText.toUpperCase()}
                                </Text>
                            </TouchableOpacity>
                        </View>
                        <DatePickerIOS
                            mode={'time'}
                            date={new Date(this.state.timestampIOS)}
                            minuteInterval={this.props.minuteInterval}
                            onDateChange={
                                (date) => {
                                    return this.handleTimeChangeIOS(date);
                                }
                            }
                        />
                    </Animated.View>
                </View>
            </Modal>
        );
    };

    renderPicker() {
        if (Platform.OS === 'ios') {
            return this.renderTimePickerIOS();
        };
    };

    render() {
        const { containerStyle, pickerContainerStyle, placeholderStyle } = this.props;

        return (
            <View
                style={[
                    styles.container,
                    containerStyle
                ]}
            >
                <TouchableOpacity
                    style={[
                        styles.inner_container,
                        pickerContainerStyle
                    ]}
                    onPress={
                        () => {
                            return this.handlePickerPress();
                        }
                    }
                >
                    <Text
                        style={[
                            styles.placeholder,
                            placeholderStyle
                        ]}
                    >
                        {this.getTimeLabel()}
                    </Text>
                </TouchableOpacity>
                {this.renderPicker()}
            </View>
        );
    }
};

TimePicker.defaultProps = {
    timestamp: moment().unix() * 1000,
    minuteInterval: 5,

    cancelButtonText: 'CANCEL',
    confirmButtonText: 'OK',

    onTimeChange: () => { },
    onPress: () => { },
};

TimePicker.propTypes = {
    timestamp: PropTypes.number,
    minuteInterval: PropTypes.number,

    cancelButtonText: PropTypes.string,
    confirmButtonText: PropTypes.string,

    onTimeChange: PropTypes.func,
    onPress: PropTypes.func,

    // containerStyle: ViewPropTypes.style,
    holderStyle: ViewPropTypes.style,
    pickerContainerStyle: ViewPropTypes.style,
    placeholderStyle: Text.propTypes.style,
    /* TODO add modal styles */
};


export default TimePicker;