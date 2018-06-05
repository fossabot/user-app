import React, { Component } from 'react';
import PropTypes from 'prop-types';
import i18n from '@dhis2/d2-i18n';
import { connect } from 'react-redux';
import { Switch, Route, withRouter } from 'react-router-dom';
import { initCurrentUser } from '../actions';
import LoadingMask from 'd2-ui/lib/loading-mask/LoadingMask.component';
import ErrorMessage from './ErrorMessage';
import ROUTE_CONFIG from '../constants/routeConfig';
import SideNav from './SideNav';

const style = {
    marginTop: '4rem',
    display: 'flex',
    flex: '1 1 0%',
    paddingRight: '2rem',
};

/**
 * This component prepares the user-app sections and routes based on the current user's authorities
 * The sections will be rendered in the SideNav and the routes within a react-router Switch component
 */
class SectionLoader extends Component {
    componentDidMount() {
        const { initCurrentUser, currentUser } = this.props;
        if (!currentUser) {
            initCurrentUser();
        }
    }

    userHasAuthorities({ entityType }) {
        if (!entityType) {
            return true;
        }
        const { currentUser, models } = this.context.d2;
        const canCreate = currentUser.canCreate(models[entityType]);
        const canDelete = currentUser.canDelete(models[entityType]);
        return canCreate || canDelete;
    }

    getRouteConfig() {
        return ROUTE_CONFIG.reduce(
            (routeConfig, configItem) => {
                let { routes, sections } = routeConfig;
                if (this.userHasAuthorities(configItem)) {
                    routes.push(configItem);
                    if (configItem.label) {
                        sections.push(configItem);
                    }
                }
                return routeConfig;
            },
            { routes: [], sections: [] }
        );
    }

    renderRoutes(routes) {
        return routes.map(section => <Route exact strict {...section} />);
    }

    renderContent() {
        const { currentUser } = this.props;

        if (!currentUser) {
            return <LoadingMask />;
        }

        if (typeof currentUser === 'string') {
            const introText = i18n.t('There was an error loading the current user');
            return <ErrorMessage introText={introText} errorMessage={currentUser} />;
        }

        const { routes, sections } = this.getRouteConfig();

        if (sections && sections.length === 0) {
            const introText = i18n.t(
                'You do not have authorities to see users, user roles or user groups'
            );
            return <ErrorMessage introText={introText} errorMessage="" />;
        }

        return [
            <SideNav key="sidenav" sections={sections} />,
            <Switch key="routeswitch">{this.renderRoutes(routes)}</Switch>,
        ];
    }

    render() {
        return <main style={style}>{this.renderContent()}</main>;
    }
}

SectionLoader.contextTypes = {
    d2: PropTypes.object,
};

SectionLoader.propTypes = {
    initCurrentUser: PropTypes.func.isRequired,
    currentUser: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
};

const mapStateToProps = ({ currentUser }) => ({ currentUser });

export default withRouter(
    connect(mapStateToProps, {
        initCurrentUser,
    })(SectionLoader)
);
