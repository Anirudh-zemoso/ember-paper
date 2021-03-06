/**
 * @module ember-paper
 */
import Ember from 'ember';
import TransitionMixin from 'ember-css-transitions/mixins/transition-mixin';

const { Component, computed, String: { htmlSafe } } = Ember;

/**
 * @class PaperBackdrop
 * @extends Ember.Component
 * @uses TransitionMixin
 */
export default Component.extend(TransitionMixin, {

  tagName: 'md-backdrop',
  classNames: ['md-default-theme'],
  classNameBindings: ['opaque:md-opaque', 'isLockedOpen:md-locked-open'],
  attributeBindings: ['backdropStyle:style'],

  // TransitionMixin:
  transitionName: 'ng',
  shouldTransition: computed.bool('opaque'),

  backdropStyle: computed('fixed', 'translateStyle', function() {
    let style = this.get('translateStyle');
    return htmlSafe(this.get('fixed') ? `position:fixed; ${style}` : style);
  }),

  addDestroyedElementClone(original, clone) {
    original.parent().append(clone);
  },

  click(e) {
    e.preventDefault();
    this.sendAction('onClick', e);
  }

});
