// @ts-nocheck
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import '../tree/tree.css';
import { MinusIcon, AddIcon } from '@chakra-ui/icons';

function classnames(...classes) {
  return classes.filter(Boolean).join(' ');
}

function isDescendant(older, younger) {
  return (
    !!older.children &&
    typeof older.children !== 'function' &&
    older.children.some(
      (child) => child === younger || isDescendant(child, younger)
    )
  );
}

class TreeNodeRenderer extends Component {
  render() {
    const {
      scaffoldBlockPxWidth,
      toggleChildrenVisibility,
      connectDragPreview,
      connectDragSource,
      isDragging,
      canDrop,
      canDrag,
      node,
      title,
      subtitle,
      draggedNode,
      path,
      treeIndex,
      isSearchMatch,
      isSearchFocus,
      buttons,
      className,
      style,
      didDrop,
      treeId,
      isOver, // Not needed, but preserved for other renderers
      parentNode, // Needed for dndManager
      rowDirection,
      ...otherProps
    } = this.props;
    const nodeTitle = title || node.title;
    const nodeSubtitle = subtitle || node.subtitle;
    const rowDirectionClass = rowDirection === 'rtl' ? 'st__rtl' : null;

    let handle;
    if (canDrag) {
      if (typeof node.children === 'function' && node.expanded) {
        // Show a loading symbol on the handle when the children are expanded
        //  and yet still defined by a function (a callback to fetch the children)
        handle = (
          <div className="st__loadingHandle">
            <div className="st__loadingCircle">
              {[...new Array(12)].map((_, index) => (
                <div
                  // eslint-disable-next-line react/no-array-index-key
                  key={index}
                  className={classnames(
                    'st__loadingCirclePoint',
                    rowDirectionClass
                  )}
                />
              ))}
            </div>
          </div>
        );
      } else {
        // Show the handle used to initiate a drag-and-drop
        handle = connectDragSource(
          <div className={`st__moveHandle st__${node.type}Dark`} />,
          {
            dropEffect: 'copy'
          }
        );
      }
    }

    const isDraggedDescendant = draggedNode && isDescendant(draggedNode, node);
    const isLandingPadActive = !didDrop && isDragging;

    let buttonStyle = { left: -0.5 * scaffoldBlockPxWidth };
    if (rowDirection === 'rtl') {
      buttonStyle = { right: -0.5 * scaffoldBlockPxWidth };
    }

    return (
      <div style={{ height: '100%' }} {...otherProps}>
        {toggleChildrenVisibility &&
          node.children &&
          (node.children.length > 0 || typeof node.children === 'function') && (
            <div>
              <button
                type="button"
                aria-label={node.expanded ? 'Collapse' : 'Expand'}
                className={classnames(
                  node.expanded ? 'st__collapseButton' : 'st__expandButton',
                  rowDirectionClass
                )}
                style={{ ...buttonStyle, display: 'flex' }}
                onClick={() =>
                  toggleChildrenVisibility({
                    node,
                    path,
                    treeIndex
                  })
                }
              >
                {node.expanded ? (
                  <MinusIcon w={2} h={2} margin="auto" />
                ) : (
                  <AddIcon w={2} h={2} margin="auto" />
                )}
              </button>

              {node.expanded && !isDragging && (
                <div
                  style={{ width: scaffoldBlockPxWidth }}
                  className={classnames('st__lineChildren', rowDirectionClass)}
                />
              )}
            </div>
          )}

        <div className={classnames('st__rowWrapper', rowDirectionClass)}>
          {/* Set the row preview to be used during drag and drop */}
          {connectDragPreview(
            <div
              className={classnames(
                'st__row',
                isLandingPadActive && 'st__rowLandingPad',
                isLandingPadActive && !canDrop && 'st__rowCancelPad',
                rowDirectionClass,
                className
              )}
              style={{
                opacity: isDraggedDescendant ? 0.5 : 1,
                ...style
              }}
            >
              {handle}

              <div
                className={classnames(
                  isSearchMatch && 'st__rowSearchMatch',
                  isSearchFocus && 'st__rowSearchFocus'
                )}
              >
                <div
                  className={classnames(
                    'st__rowContents',
                    `st__${node.type}`,
                    !canDrag && 'st__rowContentsDragDisabled',
                    rowDirectionClass
                  )}
                >
                  <div
                    className={classnames('st__rowLabel', rowDirectionClass)}
                  >
                    <div
                      className={classnames(
                        'st__rowTitle',
                        node.subtitle && 'st__rowTitleWithSubtitle'
                      )}
                    >
                      {typeof nodeTitle === 'function'
                        ? nodeTitle({
                            node,
                            path,
                            treeIndex
                          })
                        : nodeTitle}
                    </div>

                    {nodeSubtitle && (
                      <span className="st__rowSubtitle">
                        {typeof nodeSubtitle === 'function'
                          ? nodeSubtitle({
                              node,
                              path,
                              treeIndex
                            })
                          : nodeSubtitle}
                      </span>
                    )}
                  </div>

                  <div className="st__rowToolbar">
                    {buttons.map((btn, index) => (
                      <div
                        key={index} // eslint-disable-line react/no-array-index-key
                        className="st__toolbarButton"
                      >
                        {btn}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
}

TreeNodeRenderer.defaultProps = {
  isSearchMatch: false,
  isSearchFocus: false,
  canDrag: false,
  toggleChildrenVisibility: null,
  buttons: [],
  className: '',
  style: {},
  parentNode: null,
  draggedNode: null,
  canDrop: false,
  title: null,
  subtitle: null,
  rowDirection: 'ltr'
};

TreeNodeRenderer.propTypes = {
  node: PropTypes.shape({}).isRequired,
  title: PropTypes.oneOfType([PropTypes.func, PropTypes.node]),
  subtitle: PropTypes.oneOfType([PropTypes.func, PropTypes.node]),
  path: PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  ).isRequired,
  treeIndex: PropTypes.number.isRequired,
  treeId: PropTypes.string.isRequired,
  isSearchMatch: PropTypes.bool,
  isSearchFocus: PropTypes.bool,
  canDrag: PropTypes.bool,
  scaffoldBlockPxWidth: PropTypes.number.isRequired,
  toggleChildrenVisibility: PropTypes.func,
  buttons: PropTypes.arrayOf(PropTypes.node),
  className: PropTypes.string,
  style: PropTypes.shape({}),

  // Drag and drop API functions
  // Drag source
  connectDragPreview: PropTypes.func.isRequired,
  connectDragSource: PropTypes.func.isRequired,
  parentNode: PropTypes.shape({}), // Needed for dndManager
  isDragging: PropTypes.bool.isRequired,
  didDrop: PropTypes.bool.isRequired,
  draggedNode: PropTypes.shape({}),
  // Drop target
  isOver: PropTypes.bool.isRequired,
  canDrop: PropTypes.bool,

  // rtl support
  rowDirection: PropTypes.string
};

export default TreeNodeRenderer;
