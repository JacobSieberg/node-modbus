var stampit     = require('stampit'),
    Put         = require('put');


module.exports = stampit()
    .init(function () {
    
        var init = function () {
       
            this.log('initiating write multiple registers request handler.');

            if (!this.responseDelay) {
                this.responseDelay = 0;
            }

            this.setRequestHandler(16, onRequest);
        
        }.bind(this);
    
        var onRequest = function (pdu, cb) {

            setTimeout(function () {

                this.log('handling write multiple registers request.');

                if (pdu.length < 3) {
                
                    cb(Put().word8(0x90).word8(0x02).buffer());
                    return;

                }

                var fc          = pdu.readUInt8(0),
                    start       = pdu.readUInt16BE(1),
                    quantity    = pdu.readUInt16BE(3),
                    byteCount   = pdu.readUInt8(5);

                if (quantity > 0x007b) {
                
                    cb(Put().word8(0x90).word8(0x03).buffer());
                    return;
                
                }

                this.emit('writeMultipleRegistersRequest', start, quantity, byteCount);

                var mem = this.getHolding();

                if (start > mem.length || start + (quantity * 2) > mem.length) {
                
                    cb(Put().word8(0x90).word8(0x02).buffer());
                    return;

                }

                var response = Put().word8(0x10).word16be(start).word16be(quantity).buffer(),
                    j = 0, currentByte;

                for (var i = start; i < start + byteCount; i += 1) {
                
                    mem.writeUInt8(pdu.readUInt8(6 + j + 0), i);

                    j += 1;   
                
                }

                cb(response);

            }.bind(this), this.responseDelay);
        
        }.bind(this);
    

        init();
    
    });