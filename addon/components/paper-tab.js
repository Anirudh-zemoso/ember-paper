import Ember from 'ember';
import RippleMixin from '../mixins/ripple-mixin';
import ProxiableMixin from 'ember-paper/mixins/proxiable-mixin';
import ColorMixin from 'ember-paper/mixins/color-mixin';
const { computed, observer, Component, run, Object: EmberObject, String: { htmlSafe } } = Ember;

export default Component.extend(RippleMixin, ProxiableMixin, ColorMixin, {

  tagName: 'md-tab-item',

  classNames: ['md-tab'],
  classNameBindings: [
    'isActive:md-active',
    'disabled:md-disabled'
  ],
  attributeBindings: [
    'styleAttr:style'
  ],

  /* Attributes Bindings */
  styleAttr: computed('widthStyle', function() {
    return htmlSafe(`${this.get('widthStyle')}`);
  }),

  /* Style Bindings */
  widthStyle: computed('self.offsetWidth', function() {
    if (this.get('self.offsetWidth') > 0) {
      return `width: ${this.get('self.offsetWidth')}px`;
    }
    return '';
  }),

  /* Inherited from `{{paper-tabs}}` */
  disabled: computed.alias('self.disabled'),
  active: computed.alias('self.active'),
  selected: computed.reads('parent.selected'),
  previous: computed.reads('parent.previous'),
  tabs: computed.readOnly('parent.tabs'),
  wormhole: computed.readOnly('parent.wormhole'),
  shouldPaginate: computed.readOnly('parent.shouldPaginate'),
  offsetLeft: computed.reads('parent.offsetLeft'),

  /* Settings */
  noInk: computed.reads('parent.noInk'),  // todo: noink to noInk support

  rippleContainerSelector: null,

  index: computed('tabs.[]', 'self', function() {
    let { self, tabs } = this.getProperties('self', 'tabs');
    let index = tabs.indexOf(self);
    self.set('index', index); // FIXME computed props should not have such side effects
    return index;
  }),

  isActive: computed('index', 'selected', function() {
    return this.get('index') === this.get('selected');
  }),

  isLeft: computed('selected', 'index', function() {
    return this.get('index') < this.get('selected');
  }),

  isRight: computed('selected', 'index', function() {
    return this.get('index') > this.get('selected');
  }),

  setActive: observer('active', function() {
    if (this.get('active')) {
      this.send('selectTab');
    }
  }),

  didDeselect: observer('previous', 'isActive', function() {
    if ((this.get('index') !== this.get('previous')) || this.get('isActive')) {
      return;
    }
    if (this.get('onDeselect')) {
      return this.get('onDeselect')();
    }
  }),

  hasBlockTags: computed.or('self.label', 'self.content'),
  contentAsLabel: computed.not('hasBlockTags'),

  willDestroyElement() {
    this._super();
    this.get('parent').send('destroyTab', this.get('self'));
  },

  setTargetTabHeight() {
    let height = this.$(`#${this.get('self.content')}`).height();
    this.set('self.height', height);
  },

  didInsertElement() {
    let context = this;
    run.scheduleOnce('afterRender', function() {
      context.get('self').set('id', context.elementId);
      context.get('parent.tabs').pushObject(context.get('self'));
    });
  },

  updateBounds: observer('tabs.[]', 'shouldPaginate', 'offsetLeft', function() {
    let context = this;
    if (context.$().length) {
      let left = context.$()[0].offsetLeft + context.get('offsetLeft');
      let width = context.$()[0].clientWidth;
      context.set('self.offsetLeft', left);
      context.set('self.offsetWidth', width);
    }
  }),

  self: computed(function() {
    return EmberObject.create({
      disabled: false,
      offsetLeft: 0,
      offsetWidth: 0
    });
  }),

  /* Events */

  keyDown(ev) {
    if ((ev.which === 13 || 32) && !this.get('disabled')) {
      this.send('selectTab');
    }
  },

  click() {
    if (!this.get('disabled')) {
      this.send('selectTab');
    }
  },

  actions: {
    setContent(id) {
      this.set('self.content', id);
    },
    setHeight(value) {
      this.set('self.height', value);
    },
    selectTab() {
      if (this.get('onSelect')) {
        this.get('onSelect')();
      }
      this.get('parent').send('selectTab', this.get('self'));
    },
    identifyTabContent(object) {
      this.get('self').set('content', object);
    },
    identifyTabLabel(id) {
      this.get('self').set('label', id);
    }
  }
});
