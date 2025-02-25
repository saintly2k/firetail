<template>
    <div v-if="option.type == 'subtitle'" class="subtitle">{{option.label}}</div>
    <div v-else-if="option.type == 'button'" v-show="hideCheck" class="button-option">
        <p>{{option.label}}</p>
        <div @click="option.action($root)" class="button">{{option.btnLabel}}</div>
    </div>
    <div v-else-if="option.type == 'switch'" class="switch-option">
        <p>{{option.label}}</p>
        <div class="switch" :class="switchEnabled" @click="switchOnClick">
            <div class="circle-inner" />
        </div>
    </div>
    <div v-else-if="option.type == 'dropdown'" class="dropdown-option">
        <p>{{option.label}}</p>
        <div class="dropdown" @click="dropdownClick" :class="showOptions">
            <div class="default-option">
                <span>{{option.option}}</span>
                <i class="ft-icon">{{dropdownEnabled ? 'arrow-head-up' : 'arrow-head-down'}}</i>
            </div>
            <div class="options">
                <option v-for="item in option.options" :key="item" @click="optionClick(item)">{{ item }}</option>
            </div>
        </div>
    </div>
    <p v-else-if="option.type == 'text'" class="text">{{option.message}}</p>
    <About v-else-if="option.type == 'about'"/>
</template>

<script>
import About from './About'

export default {
    props: ['option'],
    components: {
        About
    },
    data() {
        return {
            dropdownEnabled: false
        }
    },
    methods: {
        updateLabel() {
            if (this.option.conditions && this.option.conditions.label) {
                const optionLabel = this.option.conditions.label
                if (optionLabel.type == 'store') {
                    const details = this.$store.state[optionLabel.module][optionLabel.state]
                    this.option.label = optionLabel.baseString.replace('$$FTINSERT$$', details.name)
                }
            }
        },
        switchOnClick() {
            this.option.enabled = !this.option.enabled
            this.option.onClick(this.$root, this.option.enabled)
        },
        dropdownClick() {
            this.dropdownEnabled = !this.dropdownEnabled
        },
        optionClick(item) {
            this.option.option = item
            this.option.onChange(this.$root, item)
        }
    },
    computed: {
        hideCheck() {
            if (this.option.conditions && this.option.conditions.show && this.option.conditions.show.type == 'store') {
                const checkoption = this.$store.state[this.option.conditions.show.module][this.option.conditions.show.state]
                return checkoption == this.option.conditions.show.onlyShow
            } else {
                return true
            }
        },
        prepWatch() {
            if (!this.option.conditions || !this.option.conditions.watch) return
            const getModState = this.option.conditions.watch.option.split('/')
            const getStoreoption = this.$store.state[getModState[0]][getModState[1]]
            return getStoreoption
        },
        switchEnabled() {
            if (this.option.enabled) {
                return 'enabled'
            } else return ''
        },
        showOptions() {
            if (this.dropdownEnabled) return 'active'
            else return ''
        }
    },
    watch: {
        prepWatch() {
            switch(this.option.conditions.watch.for) {
                case "label": {
                    this.updateLabel()
                    break;
                }
            }
        }
    },
    mounted() {
        this.updateLabel()
    },
}
</script>

<style lang="scss">
.subtitle {
    font-size: 30px;
    font-weight: bold;
    border-bottom: solid 1px #5f587c;
    padding-bottom: 15px;
    margin: 50px 0px 20px;
    letter-spacing: -0.02em;
}

.button-option, .switch-option, .dropdown-option {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 0px;
    
    p {
        margin: 0;
    }
    .button {
        height: 20px;
        display: flex;
        align-items: center;
        padding: 10px 15px;
        color: var(--hl-txt);
        border-radius: 10px;
        width: auto;
        text-transform: uppercase;
        font-weight: bold;
        cursor: pointer;
    }
    .button span {
        font-weight: bold;
        text-transform: uppercase;
    }
    .button:hover {
        background-color: var(--hl-op)
    }
    .button:active {
        background-color: var(--hl-op);
        opacity: 0.5;
    }

    .switch {
        width: 45px;
        height: 14px;
        background-color: #3d3d3d;
        border-radius: 50px;
        display: flex;
        align-items: center;
        transition-duration: 0.15s;
        transition-property: background-color;
        margin: 20px;
        margin-right: 0px;
        cursor: pointer;

        .circle-inner {
            width: 24px;
            height: 24px;
            border-radius: 50px;
            transition-duration: 0.15s;
            transition-property: transform, background-color, width;
            transform: translateX(0px);
            background-color: var(--text);
            box-shadow: 0px 1px 5px rgba(0,0,0,.25);
        }
    }

    .switch:active {
        .circle-inner {
            width: 30px;
        }
    }

    .switch.enabled {
        background-color: var(--hl-op);

        .circle-inner {
            background-color: var(--hl-txt);
            transform: translateX(21px);
        }
    }

    .switch.enabled:active {
        .circle-inner {
            transform: translateX(15px);
        }
    }

    .dropdown {
        width: 150px;
        background: var(--fg-bg);
        border-radius: 10px;
        position: relative;
        z-index: 2;
        cursor: pointer;

        .default-option {
            display: flex;
            align-items: center;
            justify-content: space-between;

            i {
                font-size: 1.2em;
            }
        }

        option, .default-option {
            padding: 10px 15px;
            text-transform: capitalize;
        }

        .options {
            display: none;
            position: absolute;
            background: var(--fg-bg);
            width: 150px;
            border-radius: 0px 0px 10px 10px;
            z-index: 1;
            
            option {
                opacity: 0.65;
            }

            option:hover {
                opacity: 1;
            }
        }
    }

    .dropdown.active {
        border-radius: 10px 10px 0px 0px;
        box-shadow: 0px 4px 4px rgba(0,0,0,.2);

        .options {
            display: block;
            box-shadow: 0px 4px 4px rgba(0,0,0,.2);
        }
    }
}

.text {
    margin-top: 10px;
    font-size: 12px;
    color: #7e769c;
}
</style>