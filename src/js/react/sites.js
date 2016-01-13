/**
 * Created by aldo on 1/8/16.
 */

/** @jsx React.DOM */
app.factory('Sites', function($filter) {
  return React.createClass({
    propTypes: {
      siteName: PropTypes.string.isRequired,
    },
    render: function() {
      return <span>Hello {this.props.siteName} </span>
    }
  });
});

Sites.$inject = ['Sites'];



